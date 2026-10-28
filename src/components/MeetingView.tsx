import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, ChevronRight, CircleCheck, CircleHelp, Gavel, ListChecks } from "lucide-react";
import type { Item, Meeting } from "@/lib/schema";
import { OpenItem, PeopleList } from "./ItemRow";
import { FollowUp } from "./FollowUp";
import { CopyButton } from "./CopyButton";
import { PrintButton } from "./PrintButton";
import { DeleteDialog } from "./DeleteDialog";
import { MeetingDetailsDialog } from "./MeetingDetailsDialog";
import { deleteMeeting } from "@/lib/actions";
import { NewMeeting } from "./NewMeeting";
import { Page, TopBar } from "./TopBar";
import { Avatar, Status, fmtDate, plural } from "./ui";

type Props = { meeting: Meeting; projectName: string; projectId: string; items: Item[]; carried: Item[]; people: string[]; team: string[]; clientEmail?: string | null; markdown: string; justPublished?: boolean };

export function MeetingView({ meeting, projectName, projectId, items, carried, people, team, clientEmail = null, markdown, justPublished = false }: Props) {
  const mom = meeting.mom!;
  const by = (k: Item["kind"]) => items.filter((i) => i.kind === k);
  const applied = mom.carried_updates.filter((u) => u.accepted).length;

  return (
    <>
      <TopBar crumbs={[{ label: projectName, href: `/p/${projectId}`, icon: Briefcase }, { label: meeting.title, icon: CircleCheck }]}>
        <CopyButton text={markdown} label="Copy as Markdown" />
        <PrintButton />
        <MeetingDetailsDialog meeting={meeting} people={[...new Set([...team, ...people])]} />
        <DeleteDialog
          label="Delete meeting"
          title={`Delete ${meeting.title}?`}
          warning={
            <>
              This deletes the meeting and its notes{items.length ? <>, and the <strong>{plural(items.length, "record")}</strong> published from it (decisions, actions, questions and their comments)</> : ""}. Open work carried from earlier meetings is not affected. <strong>This cannot be undone.</strong>
            </>
          }
          confirmLabel={items.length ? `Delete meeting and ${plural(items.length, "record")}` : "Delete meeting"}
          action={deleteMeeting.bind(null, meeting.id)}
          redirectTo={`/p/${projectId}`}
        />
      </TopBar>
      <PeopleList people={people} />

      <Page>
        {justPublished && (
          <div className="mb-6 enter flex flex-wrap items-center gap-3 rounded-lg px-4 py-3 bg-green/8">
            <CircleCheck className="size-4 text-green shrink-0" />
            <p className="text-[14px] min-w-0 flex-1 basis-[280px]">
              <span className="font-medium">Published.</span>{" "}
              <span className="text-ink-2">
                {plural(by("action").length, "action")} and {plural(by("question").length, "question")} are on the board, {plural(by("decision").length, "decision")} in the log
                {applied ? `, ${plural(applied, "earlier item")} updated` : ""}.
              </span>
            </p>
            <Link href={`/p/${projectId}/board`} className="btn btn-sm shrink-0">
              Open board <ArrowRight className="size-3" />
            </Link>
          </div>
        )}

        <div className="mb-8">
          <h1 className="h-page">{meeting.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-ink-3" />
              {fmtDate(meeting.held_on, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
              {meeting.held_time && <span className="text-ink-3">· {meeting.held_time.slice(0, 5)}</span>}
            </span>
            <span className="text-hairline-2">|</span>
            {meeting.participants.length ? (
              <span className="flex flex-wrap items-center gap-1">
                {meeting.participants.map((p) => (
                  <span key={p} className="chip h-6 pl-1">
                    <Avatar name={p} size={16} /> {p}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-ink-3">No participants listed</span>
            )}
            <span className="text-hairline-2">|</span>
            <Status value="published" />
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-8 min-[1200px]:grid-cols-[minmax(0,1fr)_300px]">
          {/* First in DOM so it sits above the record on narrow screens; the grid moves it to the rail at 1200px. */}
          <aside className="min-w-0 min-[1200px]:col-start-2 min-[1200px]:row-start-1 min-[1200px]:sticky min-[1200px]:top-[72px] self-start print:hidden">
            <div className="card p-4 next-card">
              <p className="text-[15px] font-semibold next-title">What&apos;s next</p>
              <FollowUp meetingId={meeting.id} to={clientEmail} subject={`${projectName}: ${meeting.title}`} />
              <div className="border-t border-hairline pt-4 next-start">
                <p className="text-[13px] text-ink-3 mb-2 leading-relaxed next-hint">
                  {carried.length ? `${plural(carried.length, "open item")} from earlier meetings ${carried.length === 1 ? "carries" : "carry"} into the next meeting on ${carried.length === 1 ? "its" : "their"} own.` : "Whatever is still open carries into the next meeting on its own."}
                </p>
                <NewMeeting projectId={projectId} label="Start the next meeting" />
              </div>
            </div>
          </aside>

          <article className="flex flex-col gap-9 min-w-0 max-w-[760px] min-[1200px]:col-start-1 min-[1200px]:row-start-1">
            <section>
              <H2>Summary</H2>
              <p className="body text-ink">{mom.summary}</p>
            </section>

            {mom.discussion_points.length > 0 && (
              <details className="group" open>
                <summary className="cursor-pointer select-none list-none inline-flex items-center gap-1 mb-2">
                  <ChevronRight className="size-4 text-ink-4 transition-transform duration-150 ease-(--ease-out) group-open:rotate-90" />
                  <span className="h-section">Discussion</span>
                </summary>
                <ul className="flex flex-col gap-1.5 body text-ink-2 pl-5">
                  {mom.discussion_points.map((p, i) => (
                    <li key={i} className="list-disc marker:text-ink-4">
                      {p}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <section>
              <H2 icon={Gavel} count={by("decision").length}>
                Decisions
              </H2>
              <div className="divide-y divide-hairline">
                {by("decision").map((d) => (
                  <div key={d.id} className="py-3 flex items-start gap-3">
                    <CircleCheck className={`size-4 mt-0.5 shrink-0 ${d.status === "superseded" ? "text-ink-4" : d.status === "proposed" ? "text-amber" : "text-green"}`} strokeWidth={2.2} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[15px] font-medium ${d.status === "superseded" ? "line-through text-ink-3" : ""}`}>
                        {d.title}
                        {d.status !== "confirmed" && <Status value={d.status} pill className="ml-2 align-middle" />}
                      </p>
                      {d.detail && <p className="text-ink-2 text-[14px] mt-0.5">{d.detail}</p>}
                      {d.evidence && <p className="evidence mt-1.5">“{d.evidence}”</p>}
                    </div>
                  </div>
                ))}
                {!by("decision").length && <p className="py-3 text-ink-3 text-[14px]">No decisions recorded.</p>}
              </div>
            </section>

            <section>
              <H2 icon={ListChecks} count={by("action").length}>
                Action items
              </H2>
              <div className="divide-y divide-hairline -mx-3">
                {by("action").map((a) => (
                  <div key={a.id}>
                    <OpenItem item={a} projectId={projectId} />
                    {a.evidence && <p className="evidence mx-3 mb-2.5 -mt-1">“{a.evidence}”</p>}
                  </div>
                ))}
                {!by("action").length && <p className="px-3 py-3 text-ink-3 text-[14px]">No action items.</p>}
              </div>
            </section>

            <section>
              <H2 icon={CircleHelp} count={by("question").length}>
                Open questions
              </H2>
              <div className="divide-y divide-hairline -mx-3">
                {by("question").map((qn) => (
                  <div key={qn.id}>
                    <OpenItem item={qn} projectId={projectId} />
                    {qn.evidence && <p className="evidence mx-3 mb-2.5 -mt-1">“{qn.evidence}”</p>}
                  </div>
                ))}
                {!by("question").length && <p className="px-3 py-3 text-ink-3 text-[14px]">No open questions.</p>}
              </div>
            </section>

            {mom.follow_up_context && (
              <section>
                <H2>For the next meeting</H2>
                <p className="body text-ink-2">{mom.follow_up_context}</p>
              </section>
            )}

            <details className="group">
              <summary className="cursor-pointer select-none list-none inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-ink">
                <ChevronRight className="size-3.5 transition-transform duration-150 ease-(--ease-out) group-open:rotate-90" /> Original notes
              </summary>
              <pre className="mt-2 card px-4 py-3 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink-2">{meeting.raw_notes || "No notes were saved."}</pre>
            </details>
          </article>
        </div>
      </Page>
    </>
  );
}

function H2({ icon: Icon, count, children }: { icon?: typeof CalendarDays; count?: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="size-4 text-ink-3" />}
      <h2 className="h-section">{children}</h2>
      {count !== undefined && <span className="text-[13px] text-ink-3 tabular-nums">{count}</span>}
    </div>
  );
}
