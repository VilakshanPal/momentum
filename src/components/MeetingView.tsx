import { Briefcase, CalendarDays, ChevronRight, CircleCheck, CircleHelp, FileText, Gavel, ListChecks, Users } from "lucide-react";
import type { Item, Meeting } from "@/lib/schema";
import { OpenItem, PeopleList } from "./ItemRow";
import { FollowUp } from "./FollowUp";
import { CopyButton } from "./CopyButton";
import { TopBar } from "./TopBar";
import { Avatar, Status, fmtDate } from "./ui";

type Props = { meeting: Meeting; projectName: string; projectId: string; items: Item[]; carried: Item[]; people: string[]; markdown: string };

export function MeetingView({ meeting, projectName, projectId, items, carried, people, markdown }: Props) {
  const mom = meeting.mom!;
  const by = (k: Item["kind"]) => items.filter((i) => i.kind === k);

  return (
    <>
      <TopBar crumbs={[{ label: projectName, href: `/p/${projectId}`, icon: Briefcase }, { label: meeting.title, icon: CircleCheck }]}>
        <CopyButton text={markdown} label="Copy as Markdown" />
      </TopBar>
      <PeopleList people={people} />

      <div className="px-8 pt-6 pb-5 border-b border-line">
        <h1 className="text-[26px] font-semibold tracking-tight leading-tight">{meeting.title}</h1>
        <dl className="mt-3 grid grid-cols-[110px_minmax(0,1fr)] gap-y-1.5 gap-x-3 text-[13px] max-w-2xl">
          <Prop icon={CalendarDays} label="Date">
            {fmtDate(meeting.held_on, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Prop>
          <Prop icon={Users} label="People">
            <span className="flex flex-wrap gap-1.5">
              {meeting.participants.length ? (
                meeting.participants.map((p) => (
                  <span key={p} className="chip h-6">
                    <Avatar name={p} size={16} /> {p}
                  </span>
                ))
              ) : (
                <span className="text-ink-3">Not listed</span>
              )}
            </span>
          </Prop>
          <Prop icon={CircleCheck} label="Status">
            <span className="inline-flex items-center gap-2">
              <Status value="published" pill />
              <span className="text-ink-3 text-xs">{meeting.published_at ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(meeting.published_at)) : ""}</span>
            </span>
          </Prop>
          <Prop icon={ListChecks} label="Outcomes">
            <span className="flex items-center gap-1.5">
              <span className="chip">
                <Gavel className="size-3" /> {by("decision").length} decisions
              </span>
              <span className="chip">
                <ListChecks className="size-3" /> {by("action").length} actions
              </span>
              <span className="chip">
                <CircleHelp className="size-3" /> {by("question").length} questions
              </span>
            </span>
          </Prop>
        </dl>
      </div>

      <div className="flex-1 grid grid-cols-[minmax(0,1fr)_360px] divide-x divide-line">
        <article className="px-8 py-6 flex flex-col gap-7 min-w-0">
          <section>
            <H2 icon={FileText}>Summary</H2>
            <p className="leading-relaxed text-[14.5px] max-w-[760px]">{mom.summary}</p>
          </section>

          {mom.discussion_points.length > 0 && (
            <section>
              <H2 icon={FileText}>Discussion</H2>
              <ul className="flex flex-col gap-1.5 leading-relaxed text-ink-2 max-w-[760px]">
                {mom.discussion_points.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-ink-3 text-xs mt-1.5">●</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <H2 icon={Gavel} count={by("decision").length}>
              Decisions
            </H2>
            <div className="card divide-y divide-line">
              {by("decision").map((d) => (
                <div key={d.id} className="px-3 py-2.5 flex items-start gap-3">
                  <Status value={d.status} pill className="mt-0.5 w-28 justify-start" />
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
            <H2 icon={ListChecks} count={by("action").length} hint="Live records. Status changes here show on the board.">
              Action items
            </H2>
            <div className="card divide-y divide-line">
              {by("action").map((a) => (
                <div key={a.id}>
                  <OpenItem item={a} projectId={projectId} />
                  {a.evidence && <p className="evidence mx-3 mb-2.5 -mt-1">“{a.evidence}”</p>}
                </div>
              ))}
              {!by("action").length && <p className="px-3 py-3 text-ink-3 text-[13px]">No action items.</p>}
            </div>
          </section>

          <section>
            <H2 icon={CircleHelp} count={by("question").length}>
              Open questions
            </H2>
            <div className="card divide-y divide-line">
              {by("question").map((qn) => (
                <div key={qn.id}>
                  <OpenItem item={qn} projectId={projectId} />
                  {qn.evidence && <p className="evidence mx-3 mb-2.5 -mt-1">“{qn.evidence}”</p>}
                </div>
              ))}
              {!by("question").length && <p className="px-3 py-3 text-ink-3 text-[13px]">No open questions.</p>}
            </div>
          </section>

          {mom.follow_up_context && (
            <section>
              <H2 icon={CalendarDays}>For the next meeting</H2>
              <p className="text-ink-2 leading-relaxed max-w-[760px]">{mom.follow_up_context}</p>
            </section>
          )}

          <details className="group">
            <summary className="cursor-pointer select-none list-none inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-ink">
              <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" /> Original notes
            </summary>
            <pre className="mt-2 card px-4 py-3 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink-2">{meeting.raw_notes || "No notes were saved."}</pre>
          </details>
        </article>

        <aside className="px-6 py-6 bg-paper-2/50 flex flex-col gap-6">
          <FollowUp meetingId={meeting.id} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[13px] font-semibold">Still open from earlier meetings</h2>
              <span className="chip h-5 px-1.5 text-[11px] tabular-nums">{carried.length}</span>
            </div>
            <p className="text-xs text-ink-3 mb-2">What was unresolved when this meeting happened.</p>
            <div className="card divide-y divide-line">
              {carried.length ? carried.map((i) => <OpenItem key={i.id} item={i} projectId={projectId} />) : <p className="px-3 py-3 text-ink-3 text-[13px]">Nothing was carried in.</p>}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Prop({ icon: Icon, label, children }: { icon: typeof CalendarDays; label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="inline-flex items-center gap-1.5 text-ink-3 h-6">
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className="min-h-6 flex items-center text-ink">{children}</dd>
    </>
  );
}

function H2({ icon: Icon, count, hint, children }: { icon: typeof CalendarDays; count?: number; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="size-3.5 text-ink-3" />
      <h2 className="text-[13px] font-semibold">{children}</h2>
      {count !== undefined && <span className="text-xs text-ink-3 tabular-nums">{count}</span>}
      {hint && <span className="text-xs text-ink-3">{hint}</span>}
    </div>
  );
}
