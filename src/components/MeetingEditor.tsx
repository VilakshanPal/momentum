"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CalendarDays, ChevronRight, CircleHelp, FileText, Gavel, ListChecks, Mic, PenLine, Plus, RotateCw, Sparkles, X } from "lucide-react";
import { deleteMeeting, generateDraft, publishMeeting, saveDraft, saveMeeting } from "@/lib/actions";
import type { Sample } from "@/lib/samples";
import { MAX_NOTES_CHARS, type Draft, type Item, type Meeting } from "@/lib/schema";
import { OpenItem, PeopleList } from "./ItemRow";
import { Page, TopBar } from "./TopBar";
import { DateCell } from "./DateCell";
import { PeoplePicker } from "./PeoplePicker";
import { DeleteDialog } from "./DeleteDialog";
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
  people: string[]; // names seen in this project's notes and drafts
  team: string[]; // names managed in Project settings
  sample: Sample | null; // the call of the sample story this draft is (or would become); null once all ten are published
  demo?: boolean; // arrived via "Try it with sample notes": type the notes in and generate without asking
};

export function MeetingEditor({ meeting, projectName, projectId, carried, supersedable, people, team, sample, demo = false }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(meeting.title);
  const [heldOn, setHeldOn] = useState(meeting.held_on);
  const [heldTime, setHeldTime] = useState(meeting.held_time ? meeting.held_time.slice(0, 5) : null);
  const [who, setWho] = useState(meeting.participants);
  const [notes, setNotes] = useState(meeting.raw_notes);
  const [sampleNo, setSampleNo] = useState(meeting.sample_no);
  const [draft, setDraft] = useState<Draft | null>(meeting.mom);
  const [save, setSave] = useState<"saved" | "saving" | "dirty" | "error">("saved");
  const [genErr, setGenErr] = useState<string | null>(null);
  const [pubErr, setPubErr] = useState<string | null>(null);
  const [generating, startGen] = useTransition();
  const [publishing, startPub] = useTransition();
  const [typing, setTyping] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNext = useRef(true);

  type Meta = ReturnType<typeof meta>;
  const meta = (raw = notes) => ({ title: title.trim() || "Untitled meeting", held_on: heldOn, held_time: heldTime, participants: who, raw_notes: raw, sample_no: sampleNo });

  // Debounced autosave. Nothing here creates project records; that only happens on publish.
  useEffect(() => {
    // Skip while the demo types the notes in (generate() saves them when it ends); marking dirty every 16ms tripped React's nested-update limit.
    if (skipNext.current || typing) {
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
  }, [title, heldOn, heldTime, who, notes, draft]);

  const toDraft = () => {
    if (window.innerWidth < 1200) draftRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  // `extra` carries meeting details set in the same tick as the call (the sample's title and date), which the closure would not see yet.
  const generate = (text = notes, extra: Partial<Meta> = {}) => {
    setGenErr(null);
    startGen(async () => {
      toDraft(); // one column: the progress state is under the notes, so bring it into view at the start, not only at the end
      await saveMeeting(meeting.id, { ...meta(text), ...extra });
      const r = await generateDraft(meeting.id, text);
      if (r.ok) {
        skipNext.current = true;
        setDraft(r.data);
        toDraft();
        if (!who.length && r.data.participants.length) {
          skipNext.current = true;
          setWho(r.data.participants);
        }
        setSave("saved");
      } else setGenErr(r.error);
    });
  };

  // Demo path: "type" the sample notes in over about a second so it is obvious they are being filled in for you, then generate.
  // The call's title, date and number come with it, so the meeting sits in the story where it belongs.
  const typeIn = (s: Sample | null) => {
    if (!s || typing || generating) return;
    const text = s.notes;
    const extra = { title: s.title, held_on: s.held_on, sample_no: s.n };
    setTitle(s.title);
    setHeldOn(s.held_on);
    setSampleNo(s.n);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setNotes(text);
      generate(text, extra);
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
        generate(text, extra);
      }
    }, 16);
  };

  useEffect(() => {
    if (!demo) return;
    window.history.replaceState(null, "", window.location.pathname);
    const t = setTimeout(() => typeIn(sample), 300); // let the page settle first
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

  // Below 1200px the columns stack; once a draft exists the notes fold into a strip so the draft is the first thing on screen.
  const [showNotes, setShowNotes] = useState(false);
  const stage: 1 | 2 | 3 = publishing ? 3 : draft ? 2 : 1;
  const field = "field h-10 px-3 text-[14px]";
  const lbl = "text-[13px] font-medium text-ink";

  return (
    <>
      <TopBar
        crumbs={[
          { label: projectName, href: `/p/${projectId}`, icon: Briefcase },
          { label: title || "Untitled meeting", icon: PenLine },
        ]}
      />
      <PeopleList people={people} />

      <Page className="flex-1 flex flex-col pb-0 sm:pb-0">
        {/* Meeting details: labelled fields so it is obvious everything here can be edited. The stepper rides in the head strip. */}
        <div className="card mb-6">
          <div className="min-h-10 px-4 py-1.5 flex flex-wrap items-center gap-2 border-b border-hairline bg-surface-2 rounded-t-lg">
            <PenLine className="size-3.5 text-ink-3" />
            <span className="text-[13.5px] font-medium">Meeting details</span>
            <div className="ml-auto flex items-center gap-2">
              <Stepper stage={stage} />
              <DeleteDialog label="Delete meeting" title={`Delete ${title || "this meeting"}?`} warning={<>This deletes the draft and its notes. Nothing has been published from it, so no records are affected.</>} confirmLabel="Delete draft" action={deleteMeeting.bind(null, meeting.id)} redirectTo={`/p/${projectId}`} />
            </div>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-1.5 flex-1 basis-[260px] min-w-0">
                <span className={lbl}>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder="What the meeting was about" aria-label="Meeting title" maxLength={160} />
              </label>
              <div className="flex gap-4">
                <label className="flex flex-col gap-1.5 w-40">
                  <span className={lbl}>Date</span>
                  <input type="date" value={heldOn} onChange={(e) => e.target.value && setHeldOn(e.target.value)} className={field} aria-label="Meeting date" />
                </label>
                <label className="flex flex-col gap-1.5 w-28">
                  <span className={lbl}>
                    Time <span className="font-normal text-ink-4">optional</span>
                  </span>
                  <input type="time" value={heldTime ?? ""} onChange={(e) => setHeldTime(e.target.value || null)} className={field} aria-label="Meeting time" />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="participants" className={lbl}>
                Participants
              </label>
              <PeoplePicker id="participants" value={who} onChange={setWho} options={[...team, ...people]} />
            </div>
            {pubErr && <p className="text-xs text-red">{pubErr}</p>}
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-6 min-[1200px]:grid-cols-2 flex-1 items-start">
          {/* Notes */}
          <section className="min-w-0 flex flex-col gap-5 min-[1200px]:sticky min-[1200px]:top-[72px] min-[1200px]:max-h-[calc(100vh-72px)] min-[1200px]:overflow-y-auto">
            {draft && (
              <div className="min-[1200px]:hidden">
                <button className="btn w-full justify-between text-ink-2" onClick={() => setShowNotes((v) => !v)}>
                  <span className="inline-flex items-center gap-2">
                    <FileText className="size-3.5 text-ink-3" /> Notes · {notes.length.toLocaleString()} characters
                  </span>
                  <span className="text-primary font-medium">{showNotes ? "Hide" : "Edit"}</span>
                </button>
              </div>
            )}
            <div className={`flex flex-col gap-5 ${draft && !showNotes ? "max-[1200px]:hidden" : ""}`}>
              <div className="card overflow-hidden">
                <div className="h-10 px-3 flex items-center gap-2 border-b border-hairline bg-surface-2">
                  <FileText className="size-3.5 text-ink-3" />
                  <span className="text-[13.5px] font-medium">Notes</span>
                  <span className={`ml-auto text-xs tabular-nums ${over ? "text-red" : "text-ink-4"}`}>
                    {notes.length.toLocaleString()} / {MAX_NOTES_CHARS.toLocaleString()}
                  </span>
                  {typing ? (
                    <span className="chip text-primary enter">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Typing sample notes
                    </span>
                  ) : (
                    !notes.trim() &&
                    sample && (
                      <button className="btn btn-sm" onClick={() => typeIn(sample)} title={`Fills in the notes from the next sample meeting (${sample.title}, ${fmtDate(sample.held_on)}) and generates the draft`}>
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
                  placeholder="Type, paste a transcript, or hold the Wispr Flow key and talk. Rough is fine."
                  className={`w-full px-4 py-3 leading-relaxed text-[15px] outline-none resize-none bg-transparent placeholder:text-ink-4 ${draft ? "min-h-[320px] max-h-[60vh]" : "min-h-[380px]"}`}
                  spellCheck={false}
                />
              </div>

              {!draft && (
                <div className="flex flex-wrap items-center gap-3 -mt-1">
                  <button className="btn btn-primary btn-lg max-sm:w-full justify-center" onClick={() => (tooShort ? notesRef.current?.focus() : generate())} disabled={generating || typing || over} title={tooShort ? "Add some notes first" : undefined}>
                    {generating ? <Spinner /> : <Sparkles className="size-4" />}
                    {generating ? "Generating" : "Generate draft"}
                  </button>
                  <span className="text-xs text-ink-3 inline-flex items-center gap-1">
                    <Kbd>Ctrl</Kbd>
                    <Kbd>Enter</Kbd>
                  </span>
                  <span className="text-xs text-ink-3 inline-flex items-center gap-1.5 basis-full sm:basis-auto sm:ml-auto">
                    <Mic className="size-3 shrink-0" /> Nothing leaves this page until you publish.
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Draft */}
          <section className="min-w-0 flex flex-col" ref={draftRef}>
            <div className="flex items-center gap-2 mb-3 min-h-8">
              <Sparkles className="size-4 text-primary shrink-0" />
              <h2 className="h-section whitespace-nowrap">Draft</h2>
              {draft && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-ink-2 tabular-nums">
                  <span className="chip" title="Decisions">
                    <Gavel className="size-3" /> {draft.decisions.length}
                  </span>
                  <span className="chip" title="Actions">
                    <ListChecks className="size-3" /> {draft.actions.length}
                  </span>
                  <span className="chip" title="Questions">
                    <CircleHelp className="size-3" /> {draft.questions.length}
                  </span>
                </span>
              )}
            </div>

            {genErr && (
              <div className="rounded-md bg-red/5 px-3 py-2 text-[13px] text-red flex items-center justify-between mb-3">
                <span>{genErr}</span>
                <button className="btn btn-sm" onClick={() => generate()}>
                  Retry
                </button>
              </div>
            )}

            {generating ? (
              <DraftSkeleton chars={notes.length} carried={carried.length} />
            ) : draft ? (
              <>
                <p className="text-[13px] text-ink-3 mb-4 -mt-1">Everything ticked becomes a record when you publish. Untick what is wrong, edit anything.</p>
                <DraftForm draft={draft} onChange={setDraft} carried={carried} supersedable={supersedable} />
                <div className="sticky bottom-0 mt-6 -mx-4 sm:-mx-8 min-[1200px]:mx-0 px-4 sm:px-8 min-[1200px]:px-0 bg-canvas/95 backdrop-blur border-t border-hairline">
                  <div className="h-14 flex items-center gap-3">
                    <button className="btn btn-ghost" onClick={() => generate()} disabled={!canGenerate} title="Make a fresh draft from the notes">
                      <RotateCw className="size-3.5" /> Regenerate
                    </button>
                    <span className={`text-xs ${save === "error" ? "text-red" : "text-ink-4"}`}>{{ saved: "Saved", saving: "Saving", dirty: "Unsaved", error: "Save failed" }[save]}</span>
                    <span className="ml-auto text-[13px] text-ink-2 whitespace-nowrap max-sm:hidden">{count?.items ? `${count.items} ${count.items === 1 ? "item" : "items"} will be added to the project` : "Nothing ticked"}</span>
                    <button className="btn btn-primary btn-lg max-sm:ml-auto" onClick={publish} disabled={!draft || publishing || generating || !count?.items}>
                      {publishing && <Spinner />}
                      {count?.items ? `Publish ${count.items} ${count.items === 1 ? "item" : "items"}` : "Publish"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <ol className="flex flex-col gap-4 text-[14px] text-ink-2 mt-1">
                <Step n={1} title="Add notes" body="Paste, type, or dictate. A transcript from Fireflies is fine as-is." />
                <Step n={2} title="Generate a draft" body="Decisions, actions and open questions, each with the line in your notes it came from." />
                <Step n={3} title="Review and publish" body="Untick or edit anything. Only what you publish becomes a record." />
              </ol>
            )}
          </section>
        </div>

        {carried.length > 0 && (
          <details className="group mt-8">
            <summary className="cursor-pointer select-none list-none inline-flex items-center gap-1.5 text-[13.5px] text-ink-2 hover:text-ink">
              <ChevronRight className="size-4 text-ink-4 transition-transform duration-150 ease-(--ease-out) group-open:rotate-90" />
              <span className="font-medium">
                {carried.length} {carried.length === 1 ? "item" : "items"} still open from earlier meetings
              </span>
              <span className="text-primary ml-1 group-open:hidden">Show</span>
            </summary>
            <p className="text-xs text-ink-3 mt-1 mb-2 ml-5.5">Same records, not copies. If these notes mention one, the draft will suggest an update.</p>
            <div className="card overflow-hidden grid min-[900px]:grid-cols-2 gap-px bg-hairline">
              {carried.map((i) => (
                <div key={i.id} className="bg-surface min-w-0">
                  <OpenItem item={i} projectId={projectId} />
                </div>
              ))}
            </div>
          </details>
        )}
      </Page>
    </>
  );
}

function Stepper({ stage }: { stage: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2.5 text-[13px] shrink-0" aria-label="Progress">
      {["Notes", "Review", "Publish"].map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const on = n === stage;
        return (
          <li key={label} className={`flex items-center gap-2.5 ${on ? "text-ink font-semibold" : "text-ink-3"}`}>
            <span className={`size-5 rounded-full grid place-items-center text-[11px] font-semibold ${n < stage ? "bg-green/15 text-green" : on ? "bg-ink text-surface" : "bg-wash text-ink-3"}`}>{n < stage ? "✓" : n}</span>
            {label}
            {n < 3 && <span className="w-4 h-px bg-hairline-2" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="size-6 rounded-full bg-wash text-ink-2 text-[12px] font-semibold grid place-items-center shrink-0">{n}</span>
      <span>
        <span className="font-medium text-ink text-[15px]">{title}</span>
        <span className="block text-ink-2 leading-relaxed">{body}</span>
      </span>
    </li>
  );
}

// ---------------- draft form ----------------

type ListKey = "decisions" | "actions" | "questions";

function DraftForm({ draft, onChange, carried, supersedable }: { draft: Draft; onChange: (d: Draft) => void; carried: Item[]; supersedable: Item[] }) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => onChange({ ...draft, [k]: v });
  const upd = <K extends ListKey | "carried_updates">(k: K, i: number, patch: Partial<Draft[K][number]>) => set(k, draft[k].map((x, j) => (j === i ? { ...x, ...patch } : x)) as Draft[K]);
  const del = (k: ListKey, i: number) => set(k, draft[k].filter((_, j) => j !== i) as never);
  const keep = (k: ListKey, i: number, v: boolean) => upd(k, i, { skipped: !v });
  const kept = (k: ListKey) => draft[k].filter((x) => !x.skipped).length;
  const carriedById = new Map(carried.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-7 enter-stagger">
      <Section icon={FileText} title="Summary">
        <div className="px-1 py-2.5">
          <textarea value={draft.summary} onChange={(e) => set("summary", e.target.value)} className="quiet w-full leading-relaxed resize-none text-[14.5px]" />
        </div>
      </Section>

      <Section icon={FileText} title="Discussion" count={draft.discussion_points.length} onAdd={() => set("discussion_points", [...draft.discussion_points, ""])}>
        {draft.discussion_points.map((p, i) => (
          <div key={i} className="flex gap-2 items-start px-1 py-1.5 group">
            <span className="text-ink-3 mt-[3px] text-xs">●</span>
            <textarea
              value={p}
              onChange={(e) =>
                set(
                  "discussion_points",
                  draft.discussion_points.map((x, j) => (j === i ? e.target.value : x)),
                )
              }
              className="quiet flex-1 leading-relaxed resize-none text-[13px]"
              rows={1}
              placeholder="Discussion point"
            />
            <Remove
              onClick={() =>
                set(
                  "discussion_points",
                  draft.discussion_points.filter((_, j) => j !== i),
                )
              }
            />
          </div>
        ))}
      </Section>

      <Section icon={Gavel} title="Decisions" count={kept("decisions")} total={draft.decisions.length} onAdd={() => set("decisions", [...draft.decisions, { title: "", detail: null, status: "proposed", evidence: null }])}>
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
                <span className="shrink-0">Replaces</span>
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
        {!draft.decisions.length && <p className="px-1 py-2.5 text-[13px] text-ink-3">None found in the notes.</p>}
      </Section>

      <Section icon={ListChecks} title="Action items" count={kept("actions")} total={draft.actions.length} onAdd={() => set("actions", [...draft.actions, { title: "", detail: null, owner: null, due_on: null, blocker: null, evidence: null }])}>
        {draft.actions.map((a, i) => (
          <Row key={i} kept={!a.skipped} onKeep={(v) => keep("actions", i, v)} onRemove={() => del("actions", i)}>
            <textarea value={a.title} onChange={(e) => upd("actions", i, { title: e.target.value })} className="quiet w-full font-medium resize-none text-[13.5px]" rows={1} placeholder="What needs to happen" />
            {a.detail !== null && <textarea value={a.detail} onChange={(e) => upd("actions", i, { detail: e.target.value || null })} placeholder="Detail" className="quiet mt-0.5 w-full text-[13px] text-ink-2 resize-none leading-snug" rows={1} />}
            <div className="mt-1 grid grid-cols-[minmax(120px,170px)_120px_minmax(0,1fr)] items-center gap-3">
              <OwnerField value={a.owner} onChange={(v) => upd("actions", i, { owner: v })} />
              <DateCell value={a.due_on} onChange={(v) => upd("actions", i, { due_on: v })} />
              <input value={a.blocker ?? ""} onChange={(e) => upd("actions", i, { blocker: e.target.value || null })} placeholder="Waiting on" title={a.blocker ?? undefined} className={`quiet h-7 w-full min-w-0 truncate text-[13px] ${a.blocker ? "text-red" : ""}`} />
            </div>
            <Evidence text={a.evidence} />
          </Row>
        ))}
        {!draft.actions.length && <p className="px-1 py-2.5 text-[13px] text-ink-3">None found in the notes.</p>}
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
        {!draft.questions.length && <p className="px-1 py-2.5 text-[13px] text-ink-3">None found in the notes.</p>}
      </Section>

      {draft.carried_updates.length > 0 && (
        <Section icon={RotateCw} title="Updates to earlier items" count={draft.carried_updates.length} hint="Tick to apply on publish.">
          {draft.carried_updates.map((u, i) => {
            const c = carriedById.get(u.item_id);
            if (!c) return null;
            return (
              <label key={u.item_id} className="px-1 py-2.5 flex items-start gap-2.5 cursor-pointer row">
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
        <div className="px-1 py-2.5">
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
    <section className="min-w-0">
      <div className="h-8 flex items-center gap-2 min-w-0">
        <Icon className="size-4 text-ink-3 shrink-0" />
        <h3 className="text-[15px] font-semibold whitespace-nowrap">{title}</h3>
        {count !== undefined && (
          <span className="text-[13px] text-ink-3 tabular-nums whitespace-nowrap" title={total !== undefined && total !== count ? `${count} kept of ${total} suggested` : undefined}>
            {total !== undefined && total !== count ? `${count} of ${total}` : count}
          </span>
        )}
        {hint && <span className="ml-1 text-xs text-ink-4 truncate min-w-0 max-sm:hidden">{hint}</span>}
        {onAdd && (
          <button type="button" onClick={onAdd} className="ml-auto btn btn-ghost btn-sm shrink-0">
            <Plus className="size-3" /> Add
          </button>
        )}
      </div>
      <div className="divide-y divide-hairline border-t border-hairline">{children}</div>
    </section>
  );
}

// One suggestion under review. The checkbox is the approval: unticked suggestions stay visible but are never published.
function Row({ children, kept, onKeep, onRemove }: { children: React.ReactNode; kept: boolean; onKeep: (v: boolean) => void; onRemove: () => void }) {
  return (
    <div className={`pl-1 pr-9 py-3 relative group row flex items-start gap-3 rounded-sm ${kept ? "" : "bg-surface-2"}`}>
      <input type="checkbox" checked={kept} onChange={(e) => onKeep(e.target.checked)} className="mt-[5px] accent-primary size-3.5 shrink-0 cursor-pointer" aria-label={kept ? "Kept. Untick to leave this out of the publish" : "Skipped. Tick to publish it"} title={kept ? "Will be published. Untick to skip." : "Skipped. Will not be published."} />
      <div className={`flex-1 min-w-0 ${kept ? "" : "opacity-50 [&_textarea]:line-through"}`}>{children}</div>
      <Remove onClick={onRemove} className="absolute top-2.5 right-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" />
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

// Generation is one model call of roughly ten seconds. The bar and the line change on elapsed time so the wait never looks stuck;
// the lines name what the model is asked for, in prompt order. Notes are saved before the call, so a refresh loses only the wait.
function DraftSkeleton({ chars, carried }: { chars: number; carried: number }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setT((Date.now() - t0) / 1000), 250);
    return () => clearInterval(id);
  }, []);
  const stages: [number, string][] = [
    [0, `Reading ${chars.toLocaleString()} characters of notes`],
    [1.5, "Finding decisions"],
    [4, "Pulling out actions, owners and dates"],
    [6.5, carried ? `Checking ${carried} ${carried === 1 ? "item" : "items"} still open from earlier meetings` : "Looking for open questions"],
    [9, "Writing the summary"],
    [13, "Almost there. Longer notes take a little longer."],
    [25, "Still working. Your notes are saved. This can take up to a minute."],
  ];
  const label = stages.filter(([at]) => t >= at).at(-1)![1];
  const width = 92 * (1 - Math.exp(-t / 5)); // eases towards 92%, never completes on its own
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div>
        <div className="h-0.5 rounded-full bg-wash overflow-hidden" role="progressbar" aria-label="Generating draft" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(width)}>
          <div className="h-full bg-primary transition-[width] duration-300 ease-linear" style={{ width: `${width}%` }} />
        </div>
        <p className="mt-3 text-[13px] text-ink-2 flex items-center gap-2" aria-live="polite">
          <Spinner />
          <span key={label} className="enter">
            {label}
          </span>
          <span className="ml-auto text-xs text-ink-4 tabular-nums">{Math.floor(t)}s</span>
        </p>
      </div>
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
