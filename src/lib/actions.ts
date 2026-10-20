"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { pool, q, one } from "./db";
import { carriedItems, getMeeting, getProject, listMeetingItems } from "./data";
import { generateFollowUp, generateMom } from "./llm";
import { seed } from "./seed";
import { DraftSchema, ITEM_STATUSES, MAX_NOTES_CHARS, type Draft, type Item, type ItemKind, type Meeting } from "./schema";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const cleanDate = (d: string | null | undefined) => (d && isoDate.test(d) && !isNaN(Date.parse(d)) ? d : null);
const cleanText = (s: string | null | undefined, max = 2000) => {
  const t = (s ?? "").trim();
  return t ? t.slice(0, max) : null;
};
const statusOk = (kind: ItemKind, status: string) => (ITEM_STATUSES[kind] as readonly string[]).includes(status);

// ---------- projects & meetings ----------

export async function createProject(formData: FormData) {
  const name = cleanText(formData.get("name") as string, 120);
  if (!name) return;
  const p = await one<{ id: string }>(
    `insert into projects (name, client, description) values ($1, $2, $3) returning id`,
    [name, cleanText(formData.get("client") as string, 120), cleanText(formData.get("description") as string, 500)],
  );
  revalidatePath("/", "layout");
  redirect(`/p/${p!.id}`);
}

export async function createMeeting(projectId: string, formData: FormData) {
  const title = cleanText(formData.get("title") as string, 160) ?? "Untitled meeting";
  const held_on = cleanDate(formData.get("held_on") as string) ?? new Date().toISOString().slice(0, 10);
  const m = await one<{ id: string }>(
    `insert into meetings (project_id, title, held_on) values ($1, $2, $3) returning id`,
    [projectId, title, held_on],
  );
  revalidatePath(`/p/${projectId}`);
  redirect(`/p/${projectId}/m/${m!.id}`);
}

const MetaSchema = z.object({
  title: z.string().min(1).max(160),
  held_on: z.string().regex(isoDate),
  participants: z.array(z.string().max(80)).max(30),
  raw_notes: z.string().max(MAX_NOTES_CHARS),
});

export async function saveMeeting(meetingId: string, meta: z.infer<typeof MetaSchema>): Promise<Result> {
  const parsed = MetaSchema.safeParse(meta);
  if (!parsed.success) return { ok: false, error: "Invalid meeting details." };
  const { title, held_on, participants, raw_notes } = parsed.data;
  const r = await q(
    `update meetings set title=$2, held_on=$3, participants=$4, raw_notes=$5, updated_at=now() where id=$1 and status='draft' returning id`,
    [meetingId, title, held_on, JSON.stringify(participants), raw_notes],
  );
  if (!r.length) return { ok: false, error: "Meeting is published and can no longer be edited." };
  return { ok: true, data: undefined };
}

// ---------- draft ----------

export async function generateDraft(meetingId: string, raw_notes: string): Promise<Result<Draft>> {
  if (raw_notes.trim().length < 20) return { ok: false, error: "Add some notes first (at least a few lines)." };
  if (raw_notes.length > MAX_NOTES_CHARS) return { ok: false, error: `Notes are over the ${MAX_NOTES_CHARS.toLocaleString()} character limit.` };

  const meeting = await getMeeting(meetingId);
  if (!meeting) return { ok: false, error: "Meeting not found." };
  if (meeting.status === "published") return { ok: false, error: "This meeting is already published." };
  const project = (await getProject(meeting.project_id))!;

  // Preserve the notes before anything else can fail.
  await q(`update meetings set raw_notes=$2, updated_at=now() where id=$1`, [meetingId, raw_notes]);

  const carried = await carriedItems(project.id, meeting);
  try {
    const mom = await generateMom(raw_notes, {
      projectName: project.name,
      client: project.client,
      meetingTitle: meeting.title,
      heldOn: meeting.held_on,
      participants: meeting.participants,
      carried,
    });
    const draft: Draft = {
      ...mom,
      actions: mom.actions.map((a) => ({ ...a, due_on: cleanDate(a.due_on) })),
      carried_updates: mom.carried_updates
        .map((u) => {
          // Coerce cross-kind statuses (an action marked "resolved", a question marked "done"); drop anything still invalid or unchanged.
          const item = carried.find((c) => c.id === u.item_id)!;
          const s = item.kind === "action" && u.suggested_status === "resolved" ? "done" : item.kind === "question" && u.suggested_status === "done" ? "resolved" : u.suggested_status;
          return { ...u, suggested_status: s, accepted: false };
        })
        .filter((u) => {
          const item = carried.find((c) => c.id === u.item_id)!;
          return u.suggested_status !== item.status && statusOk(item.kind, u.suggested_status);
        }),
    };
    const fill = !meeting.participants.length && draft.participants.length ? draft.participants.slice(0, 30).map((p) => p.slice(0, 80)) : null;
    await q(`update meetings set mom=$2, participants=coalesce($3, participants), updated_at=now() where id=$1`, [meetingId, JSON.stringify(draft), fill ? JSON.stringify(fill) : null]);
    return { ok: true, data: draft };
  } catch (e) {
    console.error("generateDraft failed", e);
    const msg = e instanceof Error ? e.message : "Generation failed.";
    return { ok: false, error: /api key|authentication|incorrect api key|401/i.test(msg) ? "LLM is not configured on the server (missing API key)." : msg };
  }
}

export async function saveDraft(meetingId: string, draft: Draft): Promise<Result> {
  const parsed = DraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: "Draft failed validation; nothing was saved." };
  const r = await q(`update meetings set mom=$2, updated_at=now() where id=$1 and status='draft' returning id`, [
    meetingId,
    JSON.stringify(parsed.data),
  ]);
  if (!r.length) return { ok: false, error: "Meeting is published; the draft is read-only." };
  return { ok: true, data: undefined };
}

// ---------- publish ----------

export async function publishMeeting(meetingId: string, draft: Draft): Promise<Result> {
  const parsed = DraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: "Draft failed validation; nothing was published." };
  const d = parsed.data;

  const meeting = await getMeeting(meetingId);
  if (!meeting) return { ok: false, error: "Meeting not found." };
  if (meeting.status === "published") return { ok: false, error: "Already published." };
  const pid = meeting.project_id;

  const c = await pool.connect();
  try {
    await c.query("begin");
    const ins = (kind: ItemKind, f: Partial<Item> & { title: string; status: string }, position: number) =>
      c.query<{ id: string }>(
        `insert into items (project_id, meeting_id, kind, title, detail, owner, due_on, status, blocker, evidence, supersedes_id, position)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id`,
        [pid, meetingId, kind, f.title, f.detail ?? null, f.owner ?? null, f.due_on ?? null, f.status, f.blocker ?? null, f.evidence ?? null, f.supersedes_id ?? null, position],
      );

    let i = 0;
    for (const dec of d.decisions) {
      const title = cleanText(dec.title, 300);
      if (!title || dec.skipped) continue;
      let supersedes_id: string | null = null;
      if (dec.supersedes_id) {
        const old = (
          await c.query<{ id: string }>(
            `select id from items where id=$1 and project_id=$2 and kind='decision' and status='confirmed'`,
            [dec.supersedes_id, pid],
          )
        ).rows[0];
        if (old) supersedes_id = old.id;
      }
      await ins("decision", { title, detail: cleanText(dec.detail), status: dec.status, evidence: cleanText(dec.evidence), supersedes_id }, i++);
      if (supersedes_id && dec.status === "confirmed") {
        await c.query(`update items set status='superseded', updated_at=now() where id=$1`, [supersedes_id]);
      }
    }
    i = 0;
    for (const a of d.actions) {
      const title = cleanText(a.title, 300);
      if (!title || a.skipped) continue;
      const blocker = cleanText(a.blocker);
      await ins("action", { title, detail: cleanText(a.detail), owner: cleanText(a.owner, 80), due_on: cleanDate(a.due_on), status: blocker ? "blocked" : "todo", blocker, evidence: cleanText(a.evidence) }, i++);
    }
    i = 0;
    for (const qn of d.questions) {
      const title = cleanText(qn.title, 300);
      if (!title || qn.skipped) continue;
      await ins("question", { title, owner: cleanText(qn.owner, 80), status: "open", evidence: cleanText(qn.evidence) }, i++);
    }
    // Carried-forward status changes: only those the user accepted, only valid statuses for the item's kind.
    for (const u of d.carried_updates) {
      if (!u.accepted) continue;
      const row = (await c.query<{ kind: ItemKind }>(`select kind from items where id=$1 and project_id=$2`, [u.item_id, pid])).rows[0];
      if (!row || !statusOk(row.kind, u.suggested_status)) continue;
      await c.query(`update items set status=$2, blocker=case when $2 = 'blocked' then blocker else null end, updated_at=now() where id=$1`, [u.item_id, u.suggested_status]);
    }

    await c.query(`update meetings set mom=$2, status='published', published_at=now(), updated_at=now() where id=$1`, [
      meetingId,
      JSON.stringify(d),
    ]);
    await c.query("commit");
  } catch (e) {
    await c.query("rollback");
    console.error("publish failed", e);
    return { ok: false, error: "Publishing failed. Your draft is still saved; try again." };
  } finally {
    c.release();
  }
  revalidatePath(`/p/${pid}`, "layout");
  return { ok: true, data: undefined };
}

// ---------- item tracking ----------

const PatchSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  detail: z.string().max(2000).nullable().optional(),
  owner: z.string().max(80).nullable().optional(),
  due_on: z.string().nullable().optional(),
  status: z.string().optional(),
  blocker: z.string().max(500).nullable().optional(),
});

export async function updateItem(id: string, patch: z.infer<typeof PatchSchema>): Promise<Result<Item>> {
  const parsed = PatchSchema.safeParse(patch);
  if (!parsed.success) return { ok: false, error: "Invalid change." };
  const cur = await one<Item>(`select * from items where id=$1`, [id]);
  if (!cur) return { ok: false, error: "Item not found." };
  const p = parsed.data;
  if (p.status !== undefined && !statusOk(cur.kind, p.status)) return { ok: false, error: `"${p.status}" is not a valid status for a ${cur.kind}.` };

  const status = p.status ?? cur.status;
  const blockerIn = p.blocker === undefined ? cur.blocker : cleanText(p.blocker, 500);
  const next = {
    title: p.title ?? cur.title,
    detail: p.detail === undefined ? cur.detail : cleanText(p.detail),
    owner: p.owner === undefined ? cur.owner : cleanText(p.owner, 80),
    due_on: p.due_on === undefined ? cur.due_on : cleanDate(p.due_on),
    // Leaving "blocked" clears the blocker; typing a blocker on a to-do marks it blocked.
    status: cur.kind === "action" && blockerIn && status === "todo" && p.status === undefined ? "blocked" : status,
    blocker: cur.kind === "action" && status !== "blocked" && p.status !== undefined ? null : blockerIn,
  };
  const row = await one<Item>(
    `update items set title=$2, detail=$3, owner=$4, due_on=$5, status=$6, blocker=$7, updated_at=now() where id=$1 returning *`,
    [id, next.title, next.detail, next.owner, next.due_on, next.status, next.blocker],
  );
  revalidatePath(`/p/${cur.project_id}`, "layout");
  return { ok: true, data: row! };
}

// ---------- follow-up ----------

export async function makeFollowUp(meetingId: string): Promise<Result<string>> {
  const meeting = await getMeeting(meetingId);
  if (!meeting || meeting.status !== "published" || !meeting.mom) return { ok: false, error: "Publish the meeting first." };
  const project = (await getProject(meeting.project_id))!;
  try {
    const text = await generateFollowUp({
      projectName: project.name,
      client: project.client,
      meetingTitle: meeting.title,
      heldOn: meeting.held_on,
      participants: meeting.participants,
      mom: meeting.mom,
      items: await listMeetingItems(meetingId),
      carried: await carriedItems(project.id, meeting),
    });
    return { ok: true, data: text };
  } catch (e) {
    console.error("follow-up failed", e);
    const msg = e instanceof Error ? e.message : "Generation failed.";
    return { ok: false, error: /api key|authentication|incorrect api key|401/i.test(msg) ? "LLM is not configured on the server (missing API key)." : msg };
  }
}

// ---------- demo ----------

export async function resetDemo() {
  const id = await seed();
  revalidatePath("/", "layout");
  redirect(`/p/${id}`);
}

export type { Meeting };
