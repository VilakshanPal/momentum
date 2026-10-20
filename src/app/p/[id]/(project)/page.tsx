import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, CalendarDays, CircleHelp, Gavel, ListChecks } from "lucide-react";
import { getProject, listMeetings, openItems, projectPeople, projectStats } from "@/lib/data";
import { TopBar } from "@/components/TopBar";
import { NewMeeting } from "@/components/NewMeeting";
import { OpenItem, PeopleList } from "@/components/ItemRow";
import { AvatarStack, Empty, Status, fmtDate } from "@/components/ui";

export default async function ProjectHome({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const [meetings, open, stats, people] = await Promise.all([listMeetings(id), openItems(id), projectStats(id), projectPeople(id)]);
  const actions = open.filter((i) => i.kind === "action");
  const questions = open.filter((i) => i.kind === "question");

  return (
    <>
      <TopBar crumbs={[{ label: project.name, href: `/p/${id}`, icon: Briefcase }, { label: "Meetings", icon: CalendarDays }]}>
        <NewMeeting projectId={id} />
      </TopBar>
      <PeopleList people={people} />

      <div className="px-8 py-7 grid grid-cols-[minmax(0,1fr)_320px] gap-8">
        <section className="min-w-0">
          <div className="mb-6">
            <h1 className="h-page">{project.name}</h1>
            <div className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-2">
              {project.client && <span className="chip">{project.client}</span>}
              {project.description && <span>{project.description}</span>}
            </div>
            <div className="mt-4 flex items-center gap-5 text-[13px] text-ink-2">
              <Stat icon={CalendarDays} n={stats.meetings} label="meetings" />
              <Stat icon={Gavel} n={stats.decisions} label="decisions" />
              <Stat icon={ListChecks} n={stats.open_actions} label={`open of ${stats.actions} actions`} />
              <Stat icon={CircleHelp} n={stats.open_questions} label={`open of ${stats.questions} questions`} />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_110px_120px_150px_120px] gap-3 px-4 h-9 items-center border-b border-hairline bg-surface-2">
              {["Meeting", "Date", "People", "Outcomes", "Status"].map((h) => (
                <span key={h} className="eyebrow">
                  {h}
                </span>
              ))}
            </div>
            {meetings.length ? (
              <ul className="divide-y divide-hairline">
                {meetings.map((m) => (
                  <li key={m.id}>
                    <Link href={`/p/${id}/m/${m.id}`} className="row grid grid-cols-[minmax(0,1fr)_110px_120px_150px_120px] items-center gap-3 px-4 h-12">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="size-7 rounded-md bg-wash grid place-items-center text-ink-3 shrink-0">
                          <CalendarDays className="size-3.5" />
                        </span>
                        <span className="truncate font-medium">{m.title}</span>
                      </span>
                      <span className="text-ink-2 tabular-nums">{fmtDate(m.held_on, { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>{m.participants.length ? <AvatarStack names={m.participants} /> : <span className="text-ink-3 text-xs">None listed</span>}</span>
                      {m.status === "published" ? (
                        <span className="flex items-center gap-3 text-xs text-ink-2 tabular-nums">
                          <span className="inline-flex items-center gap-1" title="Decisions">
                            <Gavel className="size-3 text-ink-3" /> {m.decisions}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Actions">
                            <ListChecks className="size-3 text-ink-3" /> {m.actions}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Questions">
                            <CircleHelp className="size-3 text-ink-3" /> {m.questions}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-ink-3">{m.raw_notes ? `${m.raw_notes.length.toLocaleString()} chars of notes` : "No notes yet"}</span>
                      )}
                      <Status value={m.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon={CalendarDays} title="No meetings yet" hint="Create one and paste your rough notes. The draft comes back in seconds." />
            )}
          </div>
        </section>

        <aside className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="h-title">Open work</h2>
            <span className="chip h-5 px-1.5 text-[11px] tabular-nums">{open.length}</span>
          </div>
          <p className="text-xs text-ink-3 mb-3 leading-relaxed">Unresolved across every meeting. These carry into the next one automatically.</p>

          <Group icon={ListChecks} title="Actions" n={actions.length}>
            {actions.length ? actions.map((i) => <OpenItem key={i.id} item={i} projectId={id} />) : <p className="px-3 py-3 text-xs text-ink-3">Nothing open.</p>}
          </Group>
          <Group icon={CircleHelp} title="Questions" n={questions.length}>
            {questions.length ? questions.map((i) => <OpenItem key={i.id} item={i} projectId={id} />) : <p className="px-3 py-3 text-xs text-ink-3">Nothing open.</p>}
          </Group>
        </aside>
      </div>
    </>
  );
}

function Stat({ icon: Icon, n, label }: { icon: typeof CalendarDays; n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 text-ink-3" />
      <span className="font-semibold text-ink tabular-nums">{n}</span>
      <span>{label}</span>
    </span>
  );
}

function Group({ icon: Icon, title, n, children }: { icon: typeof CalendarDays; title: string; n: number; children: React.ReactNode }) {
  return (
    <div className="card mb-3 overflow-hidden">
      <div className="h-8 px-3 flex items-center gap-1.5 border-b border-hairline bg-surface-2 text-xs font-medium text-ink-2">
        <Icon className="size-3.5 text-ink-3" />
        {title}
        <span className="text-ink-3 tabular-nums">{n}</span>
      </div>
      <div className="divide-y divide-hairline">{children}</div>
    </div>
  );
}
