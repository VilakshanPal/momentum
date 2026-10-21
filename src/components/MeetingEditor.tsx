"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CalendarDays, CircleHelp, FileText, Gavel, ListChecks, Mic, PenLine, Plus, RotateCw, Sparkles, Users, X } from "lucide-react";
import { generateDraft, publishMeeting, saveDraft, saveMeeting } from "@/lib/actions";
import { MAX_NOTES_CHARS, type Draft, type Item, type Meeting } from "@/lib/schema";
import { OpenItem, PeopleList } from "./ItemRow";
import { TopBar } from "./TopBar";
import { DateCell } from "./DateCell";
import { StatusMenu } from "./StatusMenu";
import { Avatar, Kbd, Spinner, Status, fmtDate } from "./ui";

// What publish will create: every suggestion the reviewer kept, plus accepted carried-forward changes.
export function publishCount(d: Draft) {
  const kept = (xs: { title: string; skipped?: boolean }[]) => xs.filter((x) => !x.skipped && x.title.trim()).length;
  return { items: kept(d.decisions) + kept(d.actions) + kept(d.questions), updates: d.carried_updates.filter((u) => u.accepted).length };
}

type Props = {
  meeting: Meeting;
  projectName: string;
  projectId: string;
  carried: Item[];
  supersedable: Item[];
  people: string[];
  sampleNotes: string;
  demo?: boolean; // arrived via "Try it with sample notes": type the notes in and generate without asking
};

export function MeetingEditor({ meeting, projectName, projectId, carried, supersedable, people, sampleNotes, demo = false }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(meeting.title);
  const [heldOn, setHeldOn] = useState(meeting.held_on);
  const [peopleText, setPeopleText] = useState(meeting.participants.join(", "));
  const [notes, setNotes] = useState(meeting.raw_notes);
  const [draft, setDraft] = useState<Draft | null>(meeting.mom);
  const [save, setSave] = useState<"saved" | "saving" | "dirty" | "error">("saved");
  const [genErr, setGenErr] = useState<string | null>(null);
  const [pubErr, setPubErr] = useState<string | null>(null);
  const [generating, startGen] = useTransition();
  const [publishing, startPub] = useTransition();
  const [typing, setTyping] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNext = useRef(true);

  const participants = () => peopleText.split(",").map((s) => s.trim()).filter(Boolean);
  const meta = (raw = notes) => ({ title: title.trim() || "Untitled meeting", held_on: heldOn, participants: participants(), raw_notes: raw });

  // Debounced autosave. Nothing here creates project records; that only happens on publish.
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    setSave("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSave("saving");
      const a = await saveMeeting(meeting.id, meta());
      const b = draft ? await saveDraft(meeting.id, draft) : { ok: true as const };
      setSave(a.ok && b.ok ? "saved" : "error");
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, heldOn, peopleText, notes, draft]);

  const generate = (text = notes) => {
    setGenErr(null);
    startGen(async () => {
      await saveMeeting(meeting.id, meta(text));
      const r = await generateDraft(meeting.id, text);
      if (r.ok) {
        skipNext.current = true;
        setDraft(r.data);
        if (!peopleText.trim() && r.data.participants.length) {
          skipNext.current = true;
          setPeopleText(r.data.participants.join(", "));
        }
        setSave("saved");
      } else setGenErr(r.error);
    });
  };

  // Demo path: "type" the sample notes in over about a second so it is obvious they are being filled in for you, then generate.
  const typeIn = (text: string) => {
    if (typing || generating) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setNotes(text);
      generate(text);
      return;
    }
    setTyping(true);
    const step = Math.ceil(text.length / 70);
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(text.length, i + step);
      setNotes(text.slice(0, i));
      const el = notesRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      if (i >= text.length) {
        clearInterval(id);
        setTyping(false);
        generate(text);
      }
    }, 16);
  };

  useEffect(() => {
    if (!demo) return;
    window.history.replaceState(null, "", window.location.pathname);
    const t = setTimeout(() => typeIn(sampleNotes), 300); // let the page settle first
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const tooShort = notes.trim().length < 20;
  const canGenerate = !generating && !typing && !over && !tooShort;
  const count = draft ? publishCount(draft) : null;

  return (
    <>
      <TopBar crumbs={[{ label: projectName, href: `/p/${projectId}`, icon: Briefcase }, { label: title || "Untitled meeting", icon: PenLine }]}>
        <span className={`text-xs mr-1 ${save === "error" ? "text-red" : "text-ink-3"}`}>{{ saved: "Saved", saving: "Saving…", dirty: "Unsaved changes", error: "Save failed" }[save]}</span>
        <button className="btn" onClick={() => generate()} disabled={!canGenerate} title={tooShort ? "Add some notes first" : "Ctrl+Enter in the notes"}>
          {generating ? <Spinner /> : draft ? <RotateCw className="size-3.5" /> : <Sparkles className="size-3.5" />}
          {draft ? "Regenerate" : "Generate draft"}
        </button>
        <button
          className="btn btn-primary"
          onClick={publish}
          disabled={!draft || publishing || generating}
          title={!draft ? "Generate and review a draft first" : "Creates the kept items as records in this project. Skipped suggestions are left out."}
        >
          {publishing && <Spinner />}
          {count && count.items ? `Publish ${count.items} ${count.items === 1 ? "item" : "items"}` : "Publish"}
        </button>
      </TopBar>
      <PeopleList people={people} />

      <div className="px-8 pt-6 pb-4 border-b border-hairline">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="quiet h-page w-full" placeholder="Untitled meeting" />
        <div className="mt-2 flex items-center gap-5 text-[13px] text-ink-2">
          <label className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-ink-3" />
            <span className="relative inline-flex items-center hover:bg-wash rounded px-1 -mx-1 h-7 cursor-pointer">
              {fmtDate(heldOn, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              <input type="date" value={heldOn} onChange={(e) => e.target.value && setHeldOn(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Meeting date" />
            </span>
          </label>
          <label className="inline-flex items-center gap-1.5 flex-1 min-w-0">
            <Users className="size-3.5 text-ink-3" />
            <input value={peopleText} onChange={(e) => setPeopleText(e.target.value)} className="quiet h-7 flex-1 min-w-0" placeholder="Participants, comma separated" />
          </label>
          <Status value="draft" pill />
        </div>
        {pubErr && <p className="mt-2 text-xs text-red">{pubErr}</p>}
      </div>

      <div className="flex-1 grid grid-cols-2 divide-x divide-hairline min-h-0">
        {/* Notes */}
        <section className="px-8 py-6 flex flex-col gap-6 min-w-0 sticky top-12 self-start max-h-[calc(100vh-48px)] overflow-y-auto [&>*]:shrink-0">
          <div className="card overflow-hidden">
            <div className="h-10 px-3 flex items-center gap-2 border-b border-hairline bg-surface-2">
              <FileText className="size-3.5 text-ink-3" />
              <span className="text-[13px] font-medium">Rough notes</span>
              <span className={`ml-auto text-xs tabular-nums ${over ? "text-red" : "text-ink-3"}`}>
                {notes.length.toLocaleString()} / {MAX_NOTES_CHARS.toLocaleString()}
              </span>
              {typing ? (
                <span className="chip text-primary enter">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Demo: typing sample notes
                </span>
              ) : (
                !notes.trim() && (
                  <button className="btn btn-sm" onClick={() => typeIn(sampleNotes)} title="Fills in notes from a sample meeting and generates the draft">
                    <Sparkles className="size-3 text-primary" /> Use sample notes
                  </button>
                )
              )}
            </div>
            <textarea
              ref={notesRef}
              value={notes}
              readOnly={typing}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canGenerate) {
                  e.preventDefault();
                  generate();
                }
              }}
              placeholder={"Type here, paste a Fireflies transcript, or hold the Wispr Flow key and talk.\n\nRough is fine. Owners and dates are only picked up when you actually said them."}
              className="w-full min-h-[440px] px-4 py-3 leading-relaxed text-[14px] outline-none resize-none bg-transparent placeholder:text-ink-3"
              spellCheck={false}
            />
          </div>
          <p className="-mt-3 text-xs text-ink-3 flex items-center gap-1.5">
            <Mic className="size-3 shrink-0" /> Dictation and pasted transcripts both work. Nothing leaves this page until you publish.
            <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap">
              <Kbd>Ctrl</Kbd>
              <Kbd>Enter</Kbd> to generate
            </span>
          </p>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="h-title">Carried forward into this meeting</h2>
              <span className="chip h-5 px-1.5 text-[11px] tabular-nums">{carried.length}</span>
            </div>
            <p className="text-xs text-ink-3 mb-2 leading-relaxed">Still unresolved from earlier meetings. Same records, not copies. Update them here instead of re-adding them.</p>
            <div className="card divide-y divide-hairline">
              {carried.length ? carried.map((i) => <OpenItem key={i.id} item={i} projectId={projectId} />) : <p className="px-3 py-3 text-ink-3 text-[13px]">Nothing carried over.</p>}
            </div>
          </div>
        </section>

        {/* Draft */}
        <section className="px-8 py-6 bg-surface-2 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-primary shrink-0" />
            <h2 className="h-title whitespace-nowrap">AI draft</h2>
            <span className="text-xs text-ink-3 truncate min-w-0">{draft ? "Review, edit, then publish. Untick anything that is wrong." : "Nothing generated yet."}</span>
            {draft && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-ink-2 tabular-nums">
                <span className="chip">
                  <Gavel className="size-3" /> {draft.decisions.length}
                </span>
                <span className="chip">
                  <ListChecks className="size-3" /> {draft.actions.length}
                </span>
                <span className="chip">
                  <CircleHelp className="size-3" /> {draft.questions.length}
                </span>
              </span>
            )}
          </div>

          {genErr && (
            <div className="card border-red/30 bg-red/5 px-3 py-2 text-[13px] text-red flex items-center justify-between mb-3">
              <span>{genErr}</span>
              <button className="btn btn-sm" onClick={() => generate()}>
                Retry
              </button>
            </div>
          )}

          {generating ? (
            <DraftSkeleton />
          ) : draft ? (
            <DraftForm draft={draft} onChange={setDraft} carried={carried} supersedable={supersedable} />
          ) : (
            <div className="card px-6 py-8">
              <p className="font-medium">Three steps, nothing automatic.</p>
              <ol className="mt-3 flex flex-col gap-3 text-[13px] text-ink-2">
                <Step n={1} title="Add rough notes" body="Paste, type, or dictate. A transcript from Fireflies is fine as-is." />
                <Step n={2} title="Generate a draft" body="Summary, decisions, actions and open questions, each with the line in your notes it came from." />
                <Step n={3} title="Review and publish" body="Edit or remove anything. Only published items become records in the project." />
              </ol>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="size-5 rounded-full bg-wash text-ink-2 text-[11px] font-semibold grid place-items-center shrink-0 mt-px">{n}</span>
      <span>
        <span className="font-medium text-ink">{title}</span>
        <span className="block text-ink-2 leading-relaxed">{body}</span>
      </span>
    </li>
  );
}

// ---------------- draft form ----------------

type ListKey = "decisions" | "actions" | "questions";

function DraftForm({ draft, onChange, carried, supersedable }: { draft: Draft; onChange: (d: Draft) => void; carried: Item[]; supersedable: Item[] }) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => onChange({ ...draft, [k]: v });
  const upd = <K extends ListKey | "carried_updates">(k: K, i: number, patch: Partial<Draft[K][number]>) =>
    set(k, draft[k].map((x, j) => (j === i ? { ...x, ...patch } : x)) as Draft[K]);
  const del = (k: ListKey, i: number) => set(k, draft[k].filter((_, j) => j !== i) as never);
  const keep = (k: ListKey, i: number, v: boolean) => upd(k, i, { skipped: !v });
  const kept = (k: ListKey) => draft[k].filter((x) => !x.skipped).length;
  const carriedById = new Map(carried.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-4 enter-stagger">
      <Section icon={FileText} title="Summary">
        <div className="px-3 py-2.5">
          <textarea value={draft.summary} onChange={(e) => set("summary", e.target.value)} className="quiet w-full leading-relaxed resize-none text-[13.5px]" />
        </div>
      </Section>

      <Section icon={FileText} title="Discussion" count={draft.discussion_points.length} onAdd={() => set("discussion_points", [...draft.discussion_points, ""])}>
        {draft.discussion_points.map((p, i) => (
          <div key={i} className="flex gap-2 items-start px-3 py-1.5 group">
            <span className="text-ink-3 mt-[3px] text-xs">●</span>
            <textarea value={p} onChange={(e) => set("discussion_points", draft.discussion_points.map((x, j) => (j === i ? e.target.value : x)))} className="quiet flex-1 leading-relaxed resize-none text-[13px]" rows={1} placeholder="Discussion point" />
            <Remove onClick={() => set("discussion_points", draft.discussion_points.filter((_, j) => j !== i))} />
          </div>
        ))}
      </Section>

      <Section icon={Gavel} title="Decisions" count={kept("decisions")} total={draft.decisions.length} hint="Confirmed only if the notes show agreement." onAdd={() => set("decisions", [...draft.decisions, { title: "", detail: null, status: "proposed", evidence: null }])}>
        {draft.decisions.map((d, i) => (
          <Row key={i} kept={!d.skipped} onKeep={(v) => keep("decisions", i, v)} onRemove={() => del("decisions", i)}>
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-px">
                <StatusMenu kind="decision" value={d.status} pill onChange={(s) => upd("decisions", i, { status: s as "proposed" | "confirmed" })} />
              </span>
              <textarea value={d.title} onChange={(e) => upd("decisions", i, { title: e.target.value })} className="quiet flex-1 font-medium resize-none text-[13.5px]" rows={1} placeholder="What was decided" />
            </div>
            <textarea value={d.detail ?? ""} onChange={(e) => upd("decisions", i, { detail: e.target.value || null })} placeholder="Add detail" className="quiet mt-1 w-full text-[13px] text-ink-2 resize-none leading-snug" rows={1} />
            {supersedable.length > 0 && (
              <label className="mt-1 flex items-center gap-1.5 text-xs text-ink-3 min-w-0">
                <span className="shrink-0">Replaces an earlier decision</span>
                <select value={d.supersedes_id ?? ""} onChange={(e) => upd("decisions", i, { supersedes_id: e.target.value || null })} className="quiet h-7 text-xs w-auto max-w-[260px] truncate text-ink-2">
                  <option value="">No</option>
                  {supersedable.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title.length > 70 ? s.title.slice(0, 70) + "…" : s.title} ({fmtDate(s.meeting_held_on)})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Evidence text={d.evidence} />
          </Row>
        ))}
        {!draft.decisions.length && <p className="px-3 py-2.5 text-xs text-ink-3">None found in the notes.</p>}
      </Section>

      <Section icon={ListChecks} title="Action items" count={kept("actions")} total={draft.actions.length} hint="Blank owner or date means the notes did not say." onAdd={() => set("actions", [...draft.actions, { title: "", detail: null, owner: null, due_on: null, blocker: null, evidence: null }])}>
        {draft.actions.map((a, i) => (
          <Row key={i} kept={!a.skipped} onKeep={(v) => keep("actions", i, v)} onRemove={() => del("actions", i)}>
            <textarea value={a.title} onChange={(e) => upd("actions", i, { title: e.target.value })} className="quiet w-full font-medium resize-none text-[13.5px]" rows={1} placeholder="What needs to happen" />
            {a.detail !== null && (
              <textarea value={a.detail} onChange={(e) => upd("actions", i, { detail: e.target.value || null })} placeholder="Detail" className="quiet mt-0.5 w-full text-[13px] text-ink-2 resize-none leading-snug" rows={1} />
            )}
            <div className="mt-1 grid grid-cols-[minmax(120px,170px)_120px_minmax(0,1fr)] items-center gap-3">
              <OwnerField value={a.owner} onChange={(v) => upd("actions", i, { owner: v })} />
              <DateCell value={a.due_on} onChange={(v) => upd("actions", i, { due_on: v })} />
              <input value={a.blocker ?? ""} onChange={(e) => upd("actions", i, { blocker: e.target.value || null })} placeholder="Blocked by (optional)" title={a.blocker ?? undefined} className={`quiet h-7 w-full min-w-0 truncate text-[13px] ${a.blocker ? "text-red" : ""}`} />
            </div>
            <Evidence text={a.evidence} />
          </Row>
        ))}
        {!draft.actions.length && <p className="px-3 py-2.5 text-xs text-ink-3">None found in the notes.</p>}
      </Section>

      <Section icon={CircleHelp} title="Open questions" count={kept("questions")} total={draft.questions.length} onAdd={() => set("questions", [...draft.questions, { title: "", owner: null, evidence: null }])}>
        {draft.questions.map((qn, i) => (
          <Row key={i} kept={!qn.skipped} onKeep={(v) => keep("questions", i, v)} onRemove={() => del("questions", i)}>
            <textarea value={qn.title} onChange={(e) => upd("questions", i, { title: e.target.value })} className="quiet w-full font-medium resize-none text-[13.5px]" rows={1} placeholder="What is still unanswered" />
            <div className="mt-1 max-w-[260px]">
              <OwnerField value={qn.owner} onChange={(v) => upd("questions", i, { owner: v })} placeholder="Who should answer" />
            </div>
            <Evidence text={qn.evidence} />
          </Row>
        ))}
        {!draft.questions.length && <p className="px-3 py-2.5 text-xs text-ink-3">None found in the notes.</p>}
      </Section>

      {draft.carried_updates.length > 0 && (
        <Section icon={RotateCw} title="Carried-forward updates" count={draft.carried_updates.length} hint="Mentioned in these notes. Tick to apply on publish.">
          {draft.carried_updates.map((u, i) => {
            const c = carriedById.get(u.item_id);
            if (!c) return null;
            return (
              <label key={u.item_id} className="px-3 py-2.5 flex items-start gap-2.5 cursor-pointer row">
                <input type="checkbox" checked={!!u.accepted} onChange={(e) => upd("carried_updates", i, { accepted: e.target.checked })} className="mt-1 accent-primary size-3.5" />
                <span className="flex-1 min-w-0 text-[13px]">
                  <span className="font-medium">{c.title}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-2">
                    <Status value={c.status} /> <span className="text-ink-3">→</span> <Status value={u.suggested_status} />
                  </span>
                  <Evidence text={u.evidence} />
                </span>
              </label>
            );
          })}
        </Section>
      )}

      <Section icon={CalendarDays} title="For the next meeting">
        <div className="px-3 py-2.5">
          <textarea value={draft.follow_up_context} onChange={(e) => set("follow_up_context", e.target.value)} className="quiet w-full leading-relaxed resize-none text-[13px]" placeholder="What the next meeting needs to pick up" />
        </div>
      </Section>
    </div>
  );
}

function OwnerField({ value, onChange, placeholder = "Unassigned" }: { value: string | null; onChange: (v: string | null) => void; placeholder?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      {value ? <Avatar name={value} size={20} /> : <span className="size-5 rounded-full border border-dashed border-hairline-2 shrink-0" />}
      <input list="people" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder={placeholder} title={value ?? undefined} className={`quiet h-7 w-full truncate text-[13px] ${value ? "" : "italic text-ink-4"}`} />
    </span>
  );
}

function Section({ icon: Icon, title, count, total, hint, onAdd, children }: { icon: typeof FileText; title: string; count?: number; total?: number; hint?: string; onAdd?: () => void; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-9 px-3 flex items-center gap-2 border-b border-hairline bg-surface-2 min-w-0">
        <Icon className="size-3.5 text-ink-3 shrink-0" />
        <span className="text-[13.5px] font-semibold whitespace-nowrap">{title}</span>
        {count !== undefined && (
          <span className="text-xs text-ink-3 tabular-nums whitespace-nowrap" title={total !== undefined && total !== count ? `${count} kept of ${total} suggested` : undefined}>
            {total !== undefined && total !== count ? `${count} of ${total}` : count}
          </span>
        )}
        {hint && <span className="ml-2 text-xs text-ink-3 truncate min-w-0">{hint}</span>}
        {onAdd && (
          <button type="button" onClick={onAdd} className="ml-auto btn btn-ghost btn-sm shrink-0">
            <Plus className="size-3" /> Add
          </button>
        )}
      </div>
      <div className="divide-y divide-hairline">{children}</div>
    </div>
  );
}

// One suggestion under review. The checkbox is the approval: unticked suggestions stay visible but are never published.
function Row({ children, kept, onKeep, onRemove }: { children: React.ReactNode; kept: boolean; onKeep: (v: boolean) => void; onRemove: () => void }) {
  return (
    <div className={`pl-3 pr-10 py-2.5 relative group row flex items-start gap-2.5 ${kept ? "" : "bg-surface-2"}`}>
      <input
        type="checkbox"
        checked={kept}
        onChange={(e) => onKeep(e.target.checked)}
        className="mt-[5px] accent-primary size-3.5 shrink-0 cursor-pointer"
        aria-label={kept ? "Kept. Untick to leave this out of the publish" : "Skipped. Tick to publish it"}
        title={kept ? "Will be published. Untick to skip." : "Skipped. Will not be published."}
      />
      <div className={`flex-1 min-w-0 ${kept ? "" : "opacity-50 [&_textarea]:line-through"}`}>{children}</div>
      <Remove onClick={onRemove} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" />
    </div>
  );
}

function Remove({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} title="Remove" className={`size-6 grid place-items-center rounded text-ink-3 hover:text-red hover:bg-red/10 ${className}`}>
      <X className="size-3" />
    </button>
  );
}

function Evidence({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="evidence mt-1.5">“{text}”</p>;
}

function DraftSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <p className="text-xs text-ink-2 flex items-center gap-2">
        <Spinner /> Reading the notes and pulling out decisions, actions and questions…
      </p>
      {[2, 3, 4, 2].map((n, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="h-9 border-b border-hairline bg-surface-2" />
          <div className="p-3 flex flex-col gap-2">
            {Array.from({ length: n }).map((_, j) => (
              <div key={j} className="skeleton h-12" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
