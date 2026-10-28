import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, CircleHelp, Gavel, House, ListChecks } from "lucide-react";
import { dueSoon, getProject, homeProjects, homeStats, nextSample, recentMeetings } from "@/lib/data";
import { DEMO_PROJECT_ID } from "@/lib/samples";
import { Page, TitleRow, TopBar } from "@/components/TopBar";
import { Welcome } from "@/components/TryDemo";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { listClients, listPeople } from "@/lib/data";
import { Empty, STATUS, Status, fmtDate, isOverdue, plural } from "@/components/ui";

export const dynamic = "force-dynamic";

const palette = ["bg-sky", "bg-purple", "bg-pink", "bg-orange", "bg-teal", "bg-green"];
const colour = (id: string) => palette[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % palette.length];

// Widget card, ClickUp Home style: title and count in the head, hairline rows below, one link on the right.
function Widget({ title, count, link, children, className = "" }: { title: string; count?: number; link?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card min-w-0 ${className}`}>
      <div className="flex items-center justify-between gap-3 px-5 h-13 border-b border-hairline">
        <h2 className="text-[16px] font-semibold">
          {title}
          {count !== undefined && <span className="ml-1.5 font-normal text-ink-4 tabular-nums">{count}</span>}
        </h2>
        {link}
      </div>
      {children}
    </section>
  );
}

// Number tile, ClickUp dashboard style: label, big tabular number, one line on what it means.
function Tile({ label, value, hint, red = false }: { label: string; value: number; hint: string; red?: boolean }) {
  return (
    <div className="card px-5 py-4 min-w-0">
      <p className="text-[13px] font-medium text-ink-3">{label}</p>
      <p className={`mt-1 text-[28px] leading-none font-semibold tabular-nums ${red && value ? "text-red" : "text-ink"}`}>{value}</p>
      <p className="mt-2 text-[12.5px] text-ink-3 leading-snug">{hint}</p>
    </div>
  );
}

const ROW = "row flex items-center gap-3 px-5 py-2.5 min-h-12 border-b border-hairline last:border-b-0 min-w-0";
const EMPTY = "px-5 py-4 text-[13.5px] text-ink-3";
const BAR: {
  key: "todo" | "in_progress" | "blocked" | "done";
  fill: string;
}[] = [
  { key: "todo", fill: "bg-ink-4" },
  { key: "in_progress", fill: "bg-primary" },
  { key: "blocked", fill: "bg-red" },
  { key: "done", fill: "bg-green" },
];

// The whole book at a glance: every project under its client, what is due, what was discussed last.
export default async function Home() {
  const [projects, due, recent, demo, clients, people, stats] = await Promise.all([homeProjects(), dueSoon(), recentMeetings(), getProject(DEMO_PROJECT_ID), listClients(), listPeople(), homeStats()]);
  const sample = demo ? await nextSample(demo.id) : null;
  const openActions = stats.todo + stats.in_progress + stats.blocked;
  const total = openActions + stats.done;
  const clientCount = new Set(projects.map((p) => p.client ?? "")).size - (projects.some((p) => !p.client) ? 1 : 0);

  // Group under the client, the way the sidebar does; projects without a client last.
  const groups = new Map<string, typeof projects>();
  for (const p of projects) groups.set(p.client ?? "", [...(groups.get(p.client ?? "") ?? []), p]);
  const sections = [...groups.entries()].filter(([k]) => k).concat(groups.has("") ? [["", groups.get("")!]] : []);

  return (
    <>
      <TopBar crumbs={[{ label: "Home", icon: House }]} />
      <Page>
        {demo && <Welcome projectId={demo.id} hasSample={!!sample} />}
        <TitleRow title="Home" subtitle={projects.length ? `${plural(projects.length, "project")} for ${plural(clientCount, "client")}` : "Nothing here yet. Create a project and paste the notes from your last meeting."} />

        {projects.length ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 grid-cols-2 min-[720px]:grid-cols-4">
              <Tile label="Open actions" value={openActions} hint={`across ${plural(projects.length, "project")}`} />
              <Tile label="Overdue" value={stats.overdue} hint={stats.overdue ? "past their date" : "nothing past its date"} red />
              <Tile label="Blocked" value={stats.blocked} hint={stats.blocked ? "waiting on someone" : "nothing waiting"} />
              <Tile label="Open questions" value={stats.open_questions} hint={stats.open_questions ? "for the next call" : "all answered"} />
            </div>

            <section className="card min-w-0 px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className="text-[16px] font-semibold">
                  Actions by status <span className="ml-1.5 font-normal text-ink-4 tabular-nums">{total}</span>
                </h2>
                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink-3 tabular-nums">
                  {BAR.map((b) => (
                    <li key={b.key} className="inline-flex items-center gap-1.5">
                      <span className={`size-2.5 rounded-xs ${b.fill}`} />
                      {STATUS[b.key].label} <span className="text-ink">{stats[b.key]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 h-2 rounded-full bg-wash overflow-hidden flex gap-px">
                {BAR.filter((b) => stats[b.key]).map((b) => (
                  <span key={b.key} className={`h-full ${b.fill}`} style={{ width: `${(stats[b.key] / total) * 100}%` }} title={`${STATUS[b.key].label}: ${stats[b.key]}`} />
                ))}
              </div>
            </section>

            <div className="grid gap-6 items-start min-[1200px]:grid-cols-2">
              <Widget
                title="Projects"
                count={projects.length}
                link={
                  <Link href="/clients" className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline shrink-0">
                    Manage clients <ArrowRight className="size-3.5" />
                  </Link>
                }
              >
                {sections.map(([client, list]) => (
                  <div key={client || "none"}>
                    <p className="eyebrow px-5 pt-3.5 pb-1.5">{client || "No client"}</p>
                    {list.map((p) => (
                      <Link key={p.id} href={`/p/${p.id}`} className={ROW}>
                        <span className={`size-7 shrink-0 rounded-[7px] grid place-items-center text-[12px] font-bold text-white ${colour(p.id)}`}>{p.name.trim().charAt(0).toUpperCase() || "P"}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14.5px] font-semibold text-ink truncate">{p.name}</span>
                          <span className="block text-[12.5px] text-ink-3 truncate mt-0.5">{p.last_id ? `${p.last_title} · ${fmtDate(p.last_held_on)}` : "No meetings yet"}</span>
                        </span>
                        <span className="flex items-center gap-3.5 text-[13px] text-ink-3 tabular-nums shrink-0">
                          <span className="inline-flex items-center gap-1" title={plural(p.open_actions, "open action")}>
                            <ListChecks className="size-3.5 text-ink-4" /> {p.open_actions}
                          </span>
                          <span className="inline-flex items-center gap-1" title={plural(p.open_questions, "open question")}>
                            <CircleHelp className="size-3.5 text-ink-4" /> {p.open_questions}
                          </span>
                          <span className="inline-flex items-center gap-1" title={plural(p.decisions, "decision")}>
                            <Gavel className="size-3.5 text-ink-4" /> {p.decisions}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ))}
              </Widget>

              <Widget title="Due soon" count={due.length} className="min-[1200px]:col-start-2 min-[1200px]:row-start-1 min-[1200px]:row-span-2">
                {due.length ? (
                  due.map((i) => {
                    const s = STATUS[i.status];
                    const late = isOverdue(i.due_on);
                    return (
                      <Link key={i.id} href={`/p/${i.project_id}/board`} className={ROW}>
                        <s.Icon className={`size-4 shrink-0 ${s.fg}`} strokeWidth={2.2} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] leading-snug text-ink break-words">{i.title}</span>
                          <span className="block text-[12.5px] text-ink-3 truncate mt-0.5">
                            {i.project_name}
                            {i.owner ? ` · ${i.owner}` : ""}
                          </span>
                        </span>
                        <span className={`shrink-0 text-[13px] tabular-nums whitespace-nowrap ${late ? "text-red font-medium" : "text-ink-3"}`}>
                          {late ? "Overdue " : "Due "}
                          {fmtDate(i.due_on)}
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <p className={EMPTY}>Nothing due in the next seven days.</p>
                )}
              </Widget>

              <Widget title="Recent meetings">
                {recent.length ? (
                  recent.map((m) => (
                    <Link key={m.id} href={`/p/${m.project_id}/m/${m.id}`} className={ROW}>
                      <CalendarDays className="size-4 shrink-0 text-ink-4" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] leading-snug text-ink truncate">{m.title || "Untitled meeting"}</span>
                        <span className="block text-[12.5px] text-ink-3 truncate mt-0.5">
                          {m.project_name} · {fmtDate(m.held_on)}
                        </span>
                      </span>
                      <Status value={m.status} className="shrink-0 text-xs" />
                    </Link>
                  ))
                ) : (
                  <p className={EMPTY}>No meetings yet.</p>
                )}
              </Widget>
            </div>
          </div>
        ) : (
          <div className="card">
            <Empty icon={Briefcase} title="No projects yet" hint="A project holds a client's meetings, decisions and open work." action={<NewProjectDialog clients={clients} people={people} />} />
          </div>
        )}
      </Page>
    </>
  );
}
