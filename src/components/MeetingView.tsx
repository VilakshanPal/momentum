import type { Item, Meeting } from "@/lib/schema";
import { ItemRow } from "./ItemRow";
import { FollowUp } from "./FollowUp";
import { CopyButton } from "./CopyButton";
import { Pill, fmtDate } from "./ui";

type Props = { meeting: Meeting; items: Item[]; carried: Item[]; projectId: string; crumb: React.ReactNode; markdown: string };

export function MeetingView({ meeting, items, carried, projectId, crumb, markdown }: Props) {
  const mom = meeting.mom!;
  const by = (k: Item["kind"]) => items.filter((i) => i.kind === k);

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-10 pt-5 pb-4 border-b border-line">
        {crumb}
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-[22px] font-semibold tracking-tight flex-1">{meeting.title}</h1>
          <Pill value="published" />
          <CopyButton text={markdown} label="Copy as Markdown" />
        </div>
        <p className="text-[13px] text-ink-2 mt-1">
          {fmtDate(meeting.held_on, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
          {meeting.participants.length ? ` · ${meeting.participants.join(", ")}` : ""}
        </p>
      </header>

      <div className="flex-1 grid grid-cols-[minmax(0,1fr)_360px] divide-x divide-line">
        <article className="px-10 py-6 max-w-[880px] flex flex-col gap-7">
          <section>
            <h2 className="label mb-1.5">Summary</h2>
            <p className="leading-relaxed">{mom.summary}</p>
          </section>

          {mom.discussion_points.length > 0 && (
            <section>
              <h2 className="label mb-1.5">Discussion</h2>
              <ul className="list-disc pl-5 flex flex-col gap-1 leading-relaxed text-ink-2">
                {mom.discussion_points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="label mb-1.5">Decisions · {by("decision").length}</h2>
            <div className="card divide-y divide-line">
              {by("decision").map((d) => (
                <div key={d.id} className="px-3 py-2.5 flex items-start gap-2.5">
                  <Pill value={d.status} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className={`font-medium ${d.status === "superseded" ? "line-through text-ink-3" : ""}`}>{d.title}</p>
                    {d.detail && <p className="text-ink-2 text-[13px] mt-0.5">{d.detail}</p>}
                    {d.evidence && <p className="evidence mt-1.5">“{d.evidence}”</p>}
                  </div>
                </div>
              ))}
              {!by("decision").length && <p className="px-3 py-3 text-ink-3 text-[13px]">No decisions recorded.</p>}
            </div>
          </section>

          <section>
            <h2 className="label mb-1.5">Action items · {by("action").length}</h2>
            <p className="text-xs text-ink-3 -mt-1 mb-1.5">Live records. Status changes here show up on the board.</p>
            <div className="card divide-y divide-line">
              {by("action").map((a) => (
                <div key={a.id}>
                  <ItemRow item={a} compact projectId={projectId} />
                  {a.evidence && <p className="evidence mx-3 mb-2 -mt-1">“{a.evidence}”</p>}
                </div>
              ))}
              {!by("action").length && <p className="px-3 py-3 text-ink-3 text-[13px]">No action items.</p>}
            </div>
          </section>

          <section>
            <h2 className="label mb-1.5">Open questions · {by("question").length}</h2>
            <div className="card divide-y divide-line">
              {by("question").map((qn) => (
                <div key={qn.id}>
                  <ItemRow item={qn} compact projectId={projectId} />
                  {qn.evidence && <p className="evidence mx-3 mb-2 -mt-1">“{qn.evidence}”</p>}
                </div>
              ))}
              {!by("question").length && <p className="px-3 py-3 text-ink-3 text-[13px]">No open questions.</p>}
            </div>
          </section>

          <details className="group">
            <summary className="label cursor-pointer select-none list-none flex items-center gap-1">
              <span className="inline-block transition-transform group-open:rotate-90">▸</span> Original notes
            </summary>
            <pre className="mt-2 card px-4 py-3 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink-2">{meeting.raw_notes || "—"}</pre>
          </details>
        </article>

        <aside className="px-6 py-6 bg-paper-2/60 flex flex-col gap-6">
          <FollowUp meetingId={meeting.id} />
          <div>
            <h2 className="label mb-1.5">Still open from earlier meetings · {carried.length}</h2>
            <div className="card divide-y divide-line">
              {carried.length ? carried.map((i) => <ItemRow key={i.id} item={i} compact projectId={projectId} />) : <p className="px-3 py-3 text-ink-3 text-[13px]">Nothing was carried in.</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
