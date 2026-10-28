"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { pool, q, one } from "./db";
import { carriedItems, getMeeting, getProject, listMeetingItems, listPeople, nextSample } from "./data";
import { resolveDraftNames } from "./names";
import { SAMPLES } from "./samples";
import { generateFollowUp, generateMom, mocked } from "./llm";
import { seed } from "./seed";
import { DraftSchema, ITEM_STATUSES, MAX_NOTES_CHARS, type Comment, type Draft, type Item, type ItemKind, type Meeting } from "./schema";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const cleanDate = (d: string | null | undefined) => (d && isoDate.test(d) && !isNaN(Date.parse(d)) ? d : null);
const cleanText = (s: string | null | undefined, max = 2000) => {
  const t = (s ?? "").trim();
  return t ? t.slice(0, max) : null;
};
const statusOk = (kind: ItemKind, status: string) => (ITEM_STATUSES[kind] as readonly string[]).includes(status);

// ---------- projects & meetings ----------

// The teammates picker posts its selection as a JSON list of names.
const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clientIdFrom = (formData: FormData) => {
  const v = ((formData.get("client_id") as string) ?? "").trim();
  return isUuid.test(v) ? v : null;
};

const teamFrom = (formData: FormData) => {
  try {
    const raw = JSON.parse((formData.get("team") as string) || "[]");
    return Array.isArray(raw) ? [...new Set(raw.filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 80)).filter(Boolean))].slice(0, 50) : [];
  } catch {
    return [];
  }
};

export async function createProject(formData: FormData) {
  const name = cleanText(formData.get("name") as string, 120);
  if (!name) return;
  const p = await one<{ id: string }>(
    `insert into projects (name, client_id, description, team) values ($1, $2, $3, $4) returning id`,
    [name, clientIdFrom(formData), cleanText(formData.get("description") as string, 500), JSON.stringify(teamFrom(formData))],
  );
  revalidatePath("/", "layout");
  redirect(`/p/${p!.id}`);
}

// Project settings: name, client and the teammates picked from the company team.
export async function updateProject(projectId: string, formData: FormData): Promise<Result> {
  const name = cleanText(formData.get("name") as string, 120);
  if (!name) return { ok: false, error: "A project needs a name." };
  await q(`update projects set name=$2, client_id=$3, team=$4 where id=$1`, [projectId, name, clientIdFrom(formData), JSON.stringify(teamFrom(formData))]);
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// ---------- search ----------

export async function search(text: string): Promise<Result<{ projects: { id: string; name: string; client: string | null }[]; meetings: { id: string; project_id: string; title: string; held_on: string; project_name: string }[]; items: { id: string; project_id: string; kind: ItemKind; title: string; status: string; project_name: string }[] }>> {
  const t = text.trim().slice(0, 80);
  if (t.length < 2) return { ok: true, data: { projects: [], meetings: [], items: [] } };
  const like = `%${t.replace(/[%_\\]/g, (c) => "\\" + c)}%`;
  const [projects, meetings, items] = await Promise.all([
    q<{ id: string; name: string; client: string | null }>(`select p.id, p.name, c.brand as client from projects p left join clients c on c.id = p.client_id where p.name ilike $1 or c.brand ilike $1 order by p.name limit 5`, [like]),
    q<{ id: string; project_id: string; title: string; held_on: string; project_name: string }>(`select m.id, m.project_id, m.title, m.held_on, p.name as project_name from meetings m join projects p on p.id = m.project_id where m.title ilike $1 or m.raw_notes ilike $1 order by m.held_on desc limit 6`, [like]),
    q<{ id: string; project_id: string; kind: ItemKind; title: string; status: string; project_name: string }>(`select i.id, i.project_id, i.kind, i.title, i.status, p.name as project_name from items i join projects p on p.id = i.project_id where i.title ilike $1 or i.detail ilike $1 order by i.created_at desc limit 8`, [like]),
  ]);
  return { ok: true, data: { projects, meetings, items } };
}

// ---------- delete and correct ----------

// Deletes the meeting and, through the foreign keys, its items and their comments. Carried-forward items from other meetings are untouched.
export async function deleteMeeting(meetingId: string): Promise<Result> {
  if (!isUuid.test(meetingId)) return { ok: false, error: "Unknown meeting." };
  await q(`delete from meetings where id = $1`, [meetingId]);
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// Deletes the project and everything in it. The dialog states the counts before the click.
export async function deleteProject(projectId: string): Promise<Result> {
  if (!isUuid.test(projectId)) return { ok: false, error: "Unknown project." };
  await q(`delete from projects where id = $1`, [projectId]);
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

const DetailsSchema = z.object({
  title: z.string().min(1).max(160),
  held_on: z.string().regex(isoDate),
  held_time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  participants: z.array(z.string().max(80)).max(30),
});

// Title, date, time and participants can be corrected on any meeting, published or not. The record is edited on the board.
export async function updateMeetingDetails(meetingId: string, input: z.infer<typeof DetailsSchema>): Promise<Result> {
  if (!isUuid.test(meetingId)) return { ok: false, error: "Unknown meeting." };
  const parsed = DetailsSchema.safeParse({ ...input, title: input.title.trim() });
  if (!parsed.success) return { ok: false, error: "Check the title and date." };
  const { title, held_on, held_time, participants } = parsed.data;
  await q(`update meetings set title=$2, held_on=$3, held_time=$4, participants=$5, updated_at=now() where id=$1`, [meetingId, title, held_on, held_time, JSON.stringify(participants)]);
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// ---------- items added by hand ----------

export async function createItem(projectId: string, input: { kind: "action" | "question"; title: string; detail: string | null; owner: string | null; due_on: string | null }): Promise<Result<Item>> {
  if (!isUuid.test(projectId)) return { ok: false, error: "Unknown project." };
  if (input.kind !== "action" && input.kind !== "question") return { ok: false, error: "Pick action or question." };
  const title = cleanText(input.title, 300);
  if (!title) return { ok: false, error: "Give it a title." };
  const r = await one<Item>(
    `insert into items (project_id, meeting_id, kind, title, detail, owner, due_on, status, position) values ($1, null, $2, $3, $4, $5, $6, $7, 0) returning *`,
    [projectId, input.kind, title, cleanText(input.detail, 2000), cleanText(input.owner, 80), input.kind === "action" ? cleanDate(input.due_on) : null, input.kind === "action" ? "todo" : "open"],
  );
  if (!r) return { ok: false, error: "Could not add it." };
  revalidatePath("/", "layout");
  return { ok: true, data: r };
}

// ---------- comments ----------

export async function listComments(itemId: string): Promise<Result<Comment[]>> {
  if (!isUuid.test(itemId)) return { ok: false, error: "Unknown item." };
  return { ok: true, data: await q<Comment>(`select * from comments where item_id = $1 order by created_at`, [itemId]) };
}

export async function addComment(itemId: string, input: { author: string | null; body: string }): Promise<Result<Comment>> {
  if (!isUuid.test(itemId)) return { ok: false, error: "Unknown item." };
  const body = cleanText(input.body, 2000);
  if (!body) return { ok: false, error: "Write something first." };
  const r = await one<Comment>(`insert into comments (item_id, author, body) values ($1, $2, $3) returning *`, [itemId, cleanText(input.author, 80), body]);
  if (!r) return { ok: false, error: "Could not save the comment." };
  return { ok: true, data: r };
}

// ---------- company team ----------

const personFields = (formData: FormData) => ({ name: cleanText(formData.get("name") as string, 80), email: cleanText(formData.get("email") as string, 200), role: cleanText(formData.get("role") as string, 80) });

export async function addPerson(formData: FormData): Promise<Result> {
  const { name, email, role } = personFields(formData);
  if (!name) return { ok: false, error: "A teammate needs a name." };
  const r = await q(`insert into people (name, email, role) values ($1, $2, $3) on conflict (name) do nothing returning name`, [name, email, role]);
  if (!r.length) return { ok: false, error: `${name} is already on the team.` };
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// A rename follows through to every project's teammates. Owners and participants on records keep the old spelling: they are history.
export async function updatePerson(oldName: string, formData: FormData): Promise<Result> {
  const { name, email, role } = personFields(formData);
  if (!name) return { ok: false, error: "A teammate needs a name." };
  const c = await pool.connect();
  try {
    await c.query("begin");
    if (name !== oldName) {
      const clash = await c.query(`select 1 from people where name = $1`, [name]);
      if (clash.rowCount) {
        await c.query("rollback");
        return { ok: false, error: `${name} is already on the team.` };
      }
    }
    await c.query(`update people set name=$2, email=$3, role=$4 where name=$1`, [oldName, name, email, role]);
    if (name !== oldName)
      await c.query(`update projects set team = (select coalesce(jsonb_agg(case when x = $1 then to_jsonb($2::text) else to_jsonb(x) end), '[]'::jsonb) from jsonb_array_elements_text(team) x) where team ? $1`, [oldName, name]);
    await c.query("commit");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// Off the team and off every project's teammates. Records keep the name.
export async function removePerson(name: string): Promise<Result> {
  await q(`update projects set team = (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from jsonb_array_elements_text(team) x where x <> $1) where team ? $1`, [name]);
  await q(`delete from people where name = $1`, [name]);
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// ---------- clients ----------

const clientFields = (formData: FormData) => ({ brand: cleanText(formData.get("brand") as string, 120), name: cleanText(formData.get("name") as string, 120), email: cleanText(formData.get("email") as string, 200) });

export async function createClient(formData: FormData): Promise<Result<{ id: string; brand: string }>> {
  const { brand, name, email } = clientFields(formData);
  if (!brand) return { ok: false, error: "A client needs a brand name." };
  const r = await q<{ id: string }>(`insert into clients (brand, name, email) values ($1, $2, $3) on conflict (brand) do nothing returning id`, [brand, name, email]);
  if (!r.length) return { ok: false, error: `${brand} is already a client.` };
  revalidatePath("/", "layout");
  return { ok: true, data: { id: r[0].id, brand } };
}

export async function updateClient(id: string, formData: FormData): Promise<Result> {
  const { brand, name, email } = clientFields(formData);
  if (!brand) return { ok: false, error: "A client needs a brand name." };
  const clash = await q(`select 1 from clients where brand = $1 and id <> $2`, [brand, id]);
  if (clash.length) return { ok: false, error: `${brand} is already a client.` };
  await q(`update clients set brand=$2, name=$3, email=$4 where id=$1`, [id, brand, name, email]);
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// Deletes the client and, through the foreign key, its projects, meetings and items. The page says so before the click.
export async function deleteClient(id: string): Promise<Result> {
  await q(`delete from clients where id = $1`, [id]);
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

// A draft nobody has typed into yet. Reused by New meeting so repeat clicks on the shared link do not pile up empty drafts.
const emptyDraft = (projectId: string) =>
  one<{ id: string }>(`select id from meetings where project_id = $1 and status = 'draft' and coalesce(raw_notes, '') = '' and mom is null order by created_at desc limit 1`, [projectId]);

export async function createMeeting(projectId: string, formData: FormData) {
  const existing = await emptyDraft(projectId);
  if (existing) redirect(`/p/${projectId}/m/${existing.id}`);
  const held_on = cleanDate(formData.get("held_on") as string) ?? new Date().toISOString().slice(0, 10);
  // No form: the meeting opens at once with a date-based title the user can rename in place.
  const title = cleanText(formData.get("title") as string, 160) ?? `Meeting, ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(held_on + "T00:00:00Z"))}`;
  const m = await one<{ id: string }>(
    `insert into meetings (project_id, title, held_on) values ($1, $2, $3) returning id`,
    [projectId, title, held_on],
  );
  revalidatePath(`/p/${projectId}`);
  redirect(`/p/${projectId}/m/${m!.id}`);
}

// Demo entry point: opens the next call of the sample story and asks the editor to type its notes in and generate.
// Reuses an unpublished draft of that call, or an empty draft, so repeat clicks on the shared link never pile up meetings.
export async function createSampleMeeting(projectId: string) {
  const sample = await nextSample(projectId);
  if (!sample) redirect(`/p/${projectId}`);
  const open = await one<{ id: string; raw_notes: string; mom: unknown }>(`select id, raw_notes, mom from meetings where project_id = $1 and status = 'draft' and sample_no = $2 order by created_at desc limit 1`, [projectId, sample.n]);
  if (open) redirect(`/p/${projectId}/m/${open.id}${open.raw_notes || open.mom ? "" : "?demo=1"}`);
  const empty = await emptyDraft(projectId);
  const m = empty
    ? await one<{ id: string }>(`update meetings set title = $2, held_on = $3, sample_no = $4, updated_at = now() where id = $1 returning id`, [empty.id, sample.title, sample.held_on, sample.n])
    : await one<{ id: string }>(`insert into meetings (project_id, title, held_on, sample_no) values ($1, $2, $3, $4) returning id`, [projectId, sample.title, sample.held_on, sample.n]);
  revalidatePath(`/p/${projectId}`);
  redirect(`/p/${projectId}/m/${m!.id}?demo=1`);
}

const MetaSchema = z.object({
  title: z.string().min(1).max(160),
  held_on: z.string().regex(isoDate),
  held_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  participants: z.array(z.string().max(80)).max(30),
  raw_notes: z.string().max(MAX_NOTES_CHARS),
  sample_no: z.number().int().min(1).max(SAMPLES.length).nullable().optional(),
});

export async function saveMeeting(meetingId: string, meta: z.infer<typeof MetaSchema>): Promise<Result> {
  const parsed = MetaSchema.safeParse(meta);
  if (!parsed.success) return { ok: false, error: "Invalid meeting details." };
  const { title, held_on, held_time, participants, raw_notes, sample_no } = parsed.data;
  const r = await q(
    `update meetings set title=$2, held_on=$3, held_time=$7, participants=$4, raw_notes=$5, sample_no=coalesce($6, sample_no), updated_at=now() where id=$1 and status='draft' returning id`,
    [meetingId, title, held_on, JSON.stringify(participants), raw_notes, sample_no ?? null, held_time ?? null],
  );
  if (!r.length) return { ok: false, error: "Meeting is published and can no longer be edited." };
  return { ok: true, data: undefined };
}

// ---------- generation budget ----------

// Shared daily cap for every model call on this link. Counts first, so a refused call is still counted.
// ponytail: one global counter, no per-visitor limit; there is no visitor identity without sign-in.
const DAILY_CAP = Number(process.env.DAILY_GENERATION_CAP ?? 300);
async function takeGeneration(): Promise<string | null> {
  const r = await one<{ n: number }>(`insert into llm_usage (day, n) values (current_date, 1) on conflict (day) do update set n = llm_usage.n + 1 returning n`);
  if (r!.n <= DAILY_CAP) return null;
  return `This hackathon demo has used its ${DAILY_CAP} generations for today. The budget resets at midnight UTC. Everything already published is still open to browse and edit.`;
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

  const capped = (await mocked()) ? null : await takeGeneration();
  if (capped) return { ok: false, error: capped };

  const carried = await carriedItems(project.id, meeting);
  try {
    const mom = await generateMom(raw_notes, {
      projectName: project.name,
      client: project.client,
      meetingTitle: meeting.title,
      heldOn: meeting.held_on,
      participants: meeting.participants,
      team: project.team,
      clientContact: project.client_contact,
      description: project.description,
      carried,
    });
    // "Rohan" in the notes is "Rohan Verma" on the team: resolve names so the board shows one person once.
    const known = [...new Set([...project.team, ...meeting.participants, ...(await listPeople())])];
    const named = resolveDraftNames(mom, known);
    const draft: Draft = {
      ...named,
      actions: named.actions.map((a) => ({ ...a, due_on: cleanDate(a.due_on) })),
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
  const capped = (await mocked()) ? null : await takeGeneration();
  if (capped) return { ok: false, error: capped };
  try {
    const text = await generateFollowUp({
      projectName: project.name,
      client: project.client,
      clientContact: project.client_contact,
      today: new Date().toISOString().slice(0, 10),
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
