import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Briefcase, CalendarDays } from "lucide-react";
import { getProject, listClients, listMeetings, listPeople, nextSample, openItems, projectPeople, projectStats } from "@/lib/data";
import { Page, TitleRow, TopBar } from "@/components/TopBar";
import { NewMeeting } from "@/components/NewMeeting";
import { ProjectSettingsDialog } from "@/components/ProjectSettingsDialog";
import { Welcome } from "@/components/TryDemo";
import { PeopleList } from "@/components/ItemRow";
import { Empty, STATUS, Status, fmtDate, plural } from "@/components/ui";

export default async function ProjectHome({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const [meetings, open, stats, people, sample, clients, team] = await Promise.all([listMeetings(id), openItems(id), projectStats(id), projectPeople(id), nextSample(id), listClients(), listPeople()]);

  const subtitle = [plural(stats.meetings, "meeting"), plural(stats.decisions, "decision"), `${stats.open_actions} open ${stats.open_actions === 1 ? "action" : "actions"}`, `${stats.open_questions} open ${stats.open_questions === 1 ? "question" : "questions"}`].join(" · ");

  return (
    <>
      <TopBar crumbs={[{ label: project.name, href: `/p/${id}`, icon: Briefcase }, { label: "Meetings", icon: CalendarDays }]} />
      <PeopleList people={people} />

      <Page>
        <Welcome projectId={id} hasSample={!!sample} />

        <TitleRow title={project.name} subtitle={project.client ? `${project.client} · ${subtitle}` : subtitle} actions={<><ProjectSettingsDialog project={project} clients={clients} people={team} counts={{ meetings: stats.meetings, records: stats.decisions + stats.actions + stats.questions }} /><NewMeeting projectId={id} /></>}>
          {project.description && <p className="mt-2 text-[14px] text-ink-2 max-w-[640px] leading-relaxed">{project.description}</p>}
        </TitleRow>

        <div className="grid gap-x-10 gap-y-10 min-[1200px]:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <h2 className="text-[16px] font-semibold mb-2">
              Meetings <span className="ml-1 font-normal text-ink-4 tabular-nums">{meetings.length}</span>
            </h2>
            {meetings.length ? (
              <ul className="flex flex-col gap-3">
                {meetings.map((m) => {
                  // One full-width card per meeting: date block, title and status, a two-line summary. Nothing else.
                  const summary = m.mom?.summary || (m.raw_notes ? "Notes pasted, draft not generated yet." : "No notes yet.");
                  return (
                    <li key={m.id}>
                      <Link href={`/p/${id}/m/${m.id}`} className="card flex gap-5 p-5 transition-[border-color,box-shadow] duration-150 hover:border-hairline-2 hover:shadow-[var(--shadow-soft)]">
                        <time dateTime={m.held_on} className="shrink-0 w-16 flex flex-col tabular-nums leading-none">
                          <span className="text-[22px] font-semibold text-ink">{fmtDate(m.held_on, { day: "numeric" })}</span>
                          <span className="mt-1.5 text-[12px] text-ink-3">{fmtDate(m.held_on, { month: "short", year: "numeric" })}</span>
                        </time>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className={`text-[16px] font-semibold leading-snug line-clamp-2 wrap-break-word ${m.title ? "text-ink" : "text-ink-3 italic"}`}>{m.title || "Untitled meeting"}</h3>
                            <Status value={m.status} pill className="shrink-0" />
                          </div>
                          <p className={`mt-1.5 max-w-[640px] text-[14px] leading-relaxed line-clamp-2 wrap-break-word ${m.mom?.summary ? "text-ink-2" : "text-ink-3"}`}>{summary}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="card">
                <Empty icon={CalendarDays} title="No meetings yet" hint="Start one and paste your notes. The draft comes back in seconds." action={<NewMeeting projectId={id} primary />} />
              </div>
            )}
          </section>

          <aside className="min-w-0">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h2 className="text-[16px] font-semibold">
                Open tasks <span className="ml-1 font-normal text-ink-4 tabular-nums">{open.length}</span>
              </h2>
            </div>
            <p className="text-[13px] text-ink-3 mb-3 leading-relaxed">Still unresolved. They carry into the next meeting on their own.</p>
            {open.length ? (
              <ul className="flex flex-col">
                {open.slice(0, 6).map((i) => {
                  const s = STATUS[i.status];
                  return (
                    <li key={i.id} className="flex items-start gap-2.5 py-2 border-b border-hairline last:border-b-0 min-w-0">
                      <s.Icon className={`size-3.5 mt-[3px] shrink-0 ${s.fg}`} strokeWidth={2.2} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] leading-snug text-ink break-words">{i.title}</span>
                        <span className="block text-xs text-ink-3 mt-0.5 truncate">{i.owner ?? "Unassigned"}{i.due_on ? ` · ${fmtDate(i.due_on)}` : ""}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[13px] text-ink-3 py-2">Nothing open.</p>
            )}
            <Link href={`/p/${id}/board`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">
              See all on the board <ArrowRight className="size-3.5" />
            </Link>
          </aside>
        </div>
      </Page>
    </>
  );
}
