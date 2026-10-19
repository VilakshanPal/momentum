"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateDraft, publishMeeting, saveDraft, saveMeeting } from "@/lib/actions";
import { MAX_NOTES_CHARS, type Draft, type Item, type Meeting } from "@/lib/schema";
import { ItemRow } from "./ItemRow";
import { Pill, Spinner, fmtDate, LABEL } from "./ui";
import { DateCell } from "./DateCell";

type Props = {
  meeting: Meeting;
  carried: Item[];
  supersedable: Item[];
  projectId: string;
  crumb: React.ReactNode;
  sampleNotes: string;
};

export function MeetingEditor({ meeting, carried, supersedable, projectId, crumb, sampleNotes }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(meeting.title);
  const [heldOn, setHeldOn] = useState(meeting.held_on);
  const [people, setPeople] = useState(meeting.participants.join(", "));
  const [notes, setNotes] = useState(meeting.raw_notes);
  const [draft, setDraft] = useState<Draft | null>(meeting.mom);
  const [save, setSave] = useState<"saved" | "saving" | "dirty" | "error">("saved");
  const [genErr, setGenErr] = useState<string | null>(null);
  const [pubErr, setPubErr] = useState<string | null>(null);
  const [generating, startGen] = useTransition();
  const [publishing, startPub] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  const participants = () => people.split(",").map((s) => s.trim()).filter(Boolean);

  // Debounced autosave of meta + notes + draft. Nothing here creates project records.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSave("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSave("saving");
      const a = await saveMeeting(meeting.id, { title: title.trim() || "Untitled meeting", held_on: heldOn, participants: participants(), raw_notes: notes });
      const b = draft ? await saveDraft(meeting.id, draft) : { ok: true as const };
      setSave(a.ok && b.ok ? "saved" : "error");
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, heldOn, people, notes, draft]);

  const generate = () => {
    setGenErr(null);
    startGen(async () => {
      // flush meta first so the model sees the right title/date/participants
      await saveMeeting(meeting.id, { title: title.trim() || "Untitled meeting", held_on: heldOn, participants: participants(), raw_notes: notes });
      const r = await generateDraft(meeting.id, notes);
      if (r.ok) {
        first.current = true; // the server already saved this draft; skip one autosave
        setDraft(r.data);
        setSave("saved");
      } else setGenErr(r.error);
    });
  };

  const publish = () => {
    if (!draft) return;
    setPubErr(null);
    startPub(async () => {
      const r = await publishMeeting(meeting.id, draft);
      if (r.ok) router.refresh();
      else setPubErr(r.error);
    });
  };

  const over = notes.length > MAX_NOTES_CHARS;

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-10 pt-5 pb-4 border-b border-line sticky top-0 bg-paper/95 backdrop-blur z-10">
        {crumb}
        <div className="flex items-center gap-3 mt-1">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="quiet text-[22px] font-semibold tracking-tight flex-1 min-w-0" placeholder="Meeting title" />
          <Pill value="draft" />
          <span className="text-xs text-ink-3 w-24 text-right">{{ saved: "Saved", saving: "Saving…", dirty: "Unsaved", error: "Save failed" }[save]}</span>
          <button className="btn" onClick={generate} disabled={generating || over || notes.trim().length < 20}>
            {generating ? <Spinner /> : null}
            {draft ? "Regenerate draft" : "Generate draft"}
          </button>
          <button className="btn btn-primary" onClick={publish} disabled={!draft || publishing || generating}>
            {publishing ? <Spinner /> : null}
            Publish
          </button>
        </div>
        <div className="flex items-center gap-4 mt-1 text-[13px] text-ink-2">
          <input type="date" value={heldOn} onChange={(e) => setHeldOn(e.target.value)} className="quiet" />
          <input value={people} onChange={(e) => setPeople(e.target.value)} className="quiet flex-1 min-w-0" placeholder="Participants, comma separated" />
        </div>
        {pubErr && <p className="mt-2 text-xs text-t-red-fg">{pubErr}</p>}
      </header>

      <div className="flex-1 grid grid-cols-2 divide-x divide-line">
        {/* Left: notes + carried forward */}
        <section className="px-10 py-6 flex flex-col gap-6">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="label">Rough notes</h2>
              <span className={`text-xs tabular-nums ${over ? "text-t-red-fg" : "text-ink-3"}`}>
                {notes.length.toLocaleString()} / {MAX_NOTES_CHARS.toLocaleString()}
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={"Type or paste rough notes, or a transcript from Fireflies.\nDictate with Wispr Flow: hold the key and talk."}
              className="w-full min-h-[360px] leading-relaxed text-[14px] outline-none resize-none bg-transparent placeholder:text-ink-3"
              spellCheck={false}
            />
            {!notes.trim() && (
              <button className="btn btn-sm" onClick={() => setNotes(sampleNotes)}>
                Use sample notes
              </button>
            )}
          </div>

          <div>
            <h2 className="label mb-2">Carried forward into this meeting · {carried.length}</h2>
            <p className="text-xs text-ink-3 -mt-1 mb-2">Still unresolved from earlier meetings. Same records, not copies. Update them here instead of re-adding them.</p>
            <div className="card divide-y divide-line">
              {carried.length ? carried.map((i) => <ItemRow key={i.id} item={i} compact projectId={projectId} />) : <p className="px-3 py-3 text-ink-3 text-[13px]">Nothing carried over.</p>}
            </div>
          </div>
        </section>

        {/* Right: draft */}
        <section className="px-10 py-6 bg-paper-2/60">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="label">AI draft · review before publishing</h2>
            {draft && <span className="text-xs text-ink-3">Edit anything. Remove what is wrong.</span>}
          </div>

          {genErr && (
            <div className="card border-t-red-fg/30 bg-t-red-bg/40 px-3 py-2 text-[13px] text-t-red-fg flex items-center justify-between mb-3">
              <span>{genErr}</span>
              <button className="btn btn-sm" onClick={generate}>
                Retry
              </button>
            </div>
          )}

          {generating ? (
            <DraftSkeleton />
          ) : draft ? (
            <DraftForm draft={draft} onChange={setDraft} carried={carried} supersedable={supersedable} />
          ) : (
            <div className="card px-6 py-12 text-center">
              <p className="text-ink-2">No draft yet.</p>
              <p className="text-xs text-ink-3 mt-1 max-w-xs mx-auto">Generate one from your notes. Nothing is added to the project until you review it and publish.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------------- draft form ----------------

function DraftForm({ draft, onChange, carried, supersedable }: { draft: Draft; onChange: (d: Draft) => void; carried: Item[]; supersedable: Item[] }) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => onChange({ ...draft, [k]: v });
  const upd = <K extends "decisions" | "actions" | "questions" | "carried_updates">(k: K, i: number, patch: Partial<Draft[K][number]>) =>
    set(k, draft[k].map((x, j) => (j === i ? { ...x, ...patch } : x)) as Draft[K]);
  const del = (k: "decisions" | "actions" | "questions", i: number) => set(k, draft[k].filter((_, j) => j !== i) as never);
  const carriedById = new Map(carried.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-5">
      <Block title="Summary">
        <textarea value={draft.summary} onChange={(e) => set("summary", e.target.value)} className="quiet w-full leading-relaxed resize-none" />
      </Block>

      <Block title="Discussion points">
        {draft.discussion_points.map((p, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-ink-3 mt-1">•</span>
            <textarea value={p} onChange={(e) => set("discussion_points", draft.discussion_points.map((x, j) => (j === i ? e.target.value : x)))} className="quiet flex-1 leading-relaxed resize-none" rows={1} />
            <Remove onClick={() => set("discussion_points", draft.discussion_points.filter((_, j) => j !== i))} />
          </div>
        ))}
      </Block>

      <Block title={`Decisions · ${draft.decisions.length}`} hint="Confirmed = the notes show agreement. Otherwise keep as proposed.">
        {draft.decisions.map((d, i) => (
          <Card key={i} onRemove={() => del("decisions", i)}>
            <div className="flex items-start gap-2">
              <button className="shrink-0 mt-0.5" onClick={() => upd("decisions", i, { status: d.status === "confirmed" ? "proposed" : "confirmed" })} title="Toggle proposed / confirmed">
                <Pill value={d.status} />
              </button>
              <textarea value={d.title} onChange={(e) => upd("decisions", i, { title: e.target.value })} className="quiet flex-1 font-medium resize-none" rows={1} />
            </div>
            <input value={d.detail ?? ""} onChange={(e) => upd("decisions", i, { detail: e.target.value || null })} placeholder="Detail (optional)" className="quiet w-full text-ink-2 mt-1" />
            {d.evidence && <p className="evidence mt-1.5">“{d.evidence}”</p>}
            {supersedable.length > 0 && (
              <label className="mt-2 flex items-center gap-2 text-xs text-ink-2">
                <span>Supersedes</span>
                <select value={d.supersedes_id ?? ""} onChange={(e) => upd("decisions", i, { supersedes_id: e.target.value || null })} className="quiet text-xs max-w-[260px] truncate">
                  <option value="">— nothing —</option>
                  {supersedable.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({fmtDate(s.meeting_held_on)})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </Card>
        ))}
        {!draft.decisions.length && <p className="text-xs text-ink-3">None extracted.</p>}
      </Block>

      <Block title={`Action items · ${draft.actions.length}`} hint="Missing owners and dates stay blank. Fill them only if you know.">
        {draft.actions.map((a, i) => (
          <Card key={i} onRemove={() => del("actions", i)}>
            <textarea value={a.title} onChange={(e) => upd("actions", i, { title: e.target.value })} className="quiet w-full font-medium resize-none" rows={1} />
            <div className="mt-1 flex items-center gap-3 text-[13px]">
              <input value={a.owner ?? ""} onChange={(e) => upd("actions", i, { owner: e.target.value || null })} placeholder="Unassigned" className={`quiet w-36 ${a.owner ? "" : "italic text-ink-3"}`} />
              <DateCell value={a.due_on} onChange={(v) => upd("actions", i, { due_on: v })} />
            </div>
            <input value={a.blocker ?? ""} onChange={(e) => upd("actions", i, { blocker: e.target.value || null })} placeholder="Blocked by / depends on (optional)" className={`quiet w-full mt-1 text-[13px] ${a.blocker ? "text-t-red-fg" : ""}`} />
            {a.evidence && <p className="evidence mt-1.5">“{a.evidence}”</p>}
          </Card>
        ))}
        {!draft.actions.length && <p className="text-xs text-ink-3">None extracted.</p>}
      </Block>

      <Block title={`Open questions · ${draft.questions.length}`}>
        {draft.questions.map((qn, i) => (
          <Card key={i} onRemove={() => del("questions", i)}>
            <textarea value={qn.title} onChange={(e) => upd("questions", i, { title: e.target.value })} className="quiet w-full font-medium resize-none" rows={1} />
            <input value={qn.owner ?? ""} onChange={(e) => upd("questions", i, { owner: e.target.value || null })} placeholder="Who should answer (optional)" className={`quiet w-56 mt-1 text-[13px] ${qn.owner ? "" : "italic text-ink-3"}`} />
            {qn.evidence && <p className="evidence mt-1.5">“{qn.evidence}”</p>}
          </Card>
        ))}
        {!draft.questions.length && <p className="text-xs text-ink-3">None extracted.</p>}
      </Block>

      {draft.carried_updates.length > 0 && (
        <Block title={`Updates to carried-forward work · ${draft.carried_updates.length}`} hint="The notes mention existing items. Tick to apply the status change on publish. Unticked = no change.">
          {draft.carried_updates.map((u, i) => {
            const c = carriedById.get(u.item_id);
            if (!c) return null;
            return (
              <label key={u.item_id} className="card px-3 py-2 flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={!!u.accepted} onChange={(e) => upd("carried_updates", i, { accepted: e.target.checked })} className="mt-1 accent-accent" />
                <span className="flex-1 text-[13px]">
                  <span className="font-medium">{c.title}</span>
                  <span className="text-ink-2">
                    {" "}
                    · <Pill value={c.status} /> → <Pill value={u.suggested_status} />
                  </span>
                  {u.evidence && <span className="evidence block mt-1">“{u.evidence}”</span>}
                </span>
              </label>
            );
          })}
        </Block>
      )}

      <Block title="Follow-up context">
        <textarea value={draft.follow_up_context} onChange={(e) => set("follow_up_context", e.target.value)} className="quiet w-full leading-relaxed resize-none" />
      </Block>
    </div>
  );
}

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label mb-1.5">{title}</h3>
      {hint && <p className="text-xs text-ink-3 -mt-1 mb-2">{hint}</p>}
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Card({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="card px-3 py-2.5 relative group">
      {children}
      <Remove onClick={onRemove} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

function Remove({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} title="Remove" className={`size-6 grid place-items-center rounded text-ink-3 hover:text-t-red-fg hover:bg-t-red-bg ${className}`}>
      <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 2l8 8M10 2l-8 8" />
      </svg>
    </button>
  );
}

function DraftSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy>
      <p className="text-xs text-ink-3 flex items-center gap-2">
        <Spinner /> Reading notes and extracting decisions, actions and questions…
      </p>
      {[3, 4, 3, 2].map((n, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="skeleton h-3 w-24" />
          {Array.from({ length: n }).map((_, j) => (
            <div key={j} className="skeleton h-14" />
          ))}
        </div>
      ))}
    </div>
  );
}

export { LABEL };
