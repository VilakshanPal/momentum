import Link from "next/link";
import { CalendarDays, Gavel, House, ListChecks } from "lucide-react";
import { listClients, listPeople, listProjects, projectStats } from "@/lib/data";
import { mocked } from "@/lib/llm";
import { NavLink } from "./NavLink";
import { ProjectGroup } from "./ProjectGroup";
import { NewProjectDialog } from "./NewProjectDialog";
import { ResetDemo } from "./ResetDemo";
import { Briefcase, Users } from "lucide-react";
import { NavBackdrop } from "./NavToggle";
import { AboutDialog } from "./AboutDialog";
import { SearchDialog } from "./SearchDialog";

export async function Sidebar() {
  const projects = await listProjects();
  const [stats, dev, clients, people] = await Promise.all([Promise.all(projects.map((p) => projectStats(p.id))), mocked(), listClients(), listPeople()]);

  // Projects grouped under their client, ClickUp Spaces style, but the client is a label, not a fourth clickable level.
  // Projects without a client come last, under "No client" only when named clients exist.
  const groups = new Map<string, { label: string; rows: number[] }>();
  projects.forEach((p, i) => {
    const label = p.client?.trim() ?? "";
    const g = groups.get(label.toLowerCase()) ?? { label, rows: [] };
    g.rows.push(i);
    groups.set(label.toLowerCase(), g);
  });
  const named = [...groups.values()].filter((g) => g.label).sort((a, b) => a.label.localeCompare(b.label)); // same order as Home
  const unnamed = groups.get("");
  const sections = unnamed ? [...named, { label: named.length ? "No client" : "", rows: unnamed.rows }] : named;

  return (
    <>
      <NavBackdrop />
      <aside className="sidebar w-[232px] shrink-0 h-full bg-canvas flex flex-col text-[14px] print:hidden">
        <Link href="/" className="h-14 px-4 flex items-center gap-2.5 shrink-0">
          <span className="size-7 rounded-lg bg-ink text-surface grid place-items-center text-[13px] font-bold tracking-tight">M</span>
          <span className="text-[15px] font-semibold text-ink tracking-[-0.2px]">MOMentum</span>
        </Link>

        <nav className="px-3 pt-3 flex flex-col gap-px overflow-y-auto flex-1 min-h-0">
          <NavLink href="/" exact>
            <House className="size-4 text-ink-4" />
            Home
          </NavLink>
          <div className="mb-3">
            <SearchDialog />
          </div>
          <div className="h-7 pl-2 pr-0.5 mb-1 flex items-center justify-between">
            <span className="eyebrow">Projects</span>
            <NewProjectDialog clients={clients} people={people} />
          </div>
          {sections.map((g, gi) => (
            <div key={g.label} className="flex flex-col gap-px">
              {g.label && (
                <span className={`pl-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.3px] text-ink-4 truncate ${gi ? "mt-3" : ""}`} title={g.label}>
                  {g.label}
                </span>
              )}
              {g.rows.map((i) => {
                const p = projects[i];
                return (
                  <ProjectGroup key={p.id} id={p.id} name={p.name}>
                    <NavLink href={`/p/${p.id}`} exact also={`/p/${p.id}/m`} className="pl-8">
                      <CalendarDays className="size-4 text-ink-4" />
                      Meetings
                      <span className="ml-auto text-xs text-ink-4 tabular-nums">{stats[i].meetings}</span>
                    </NavLink>
                    <NavLink href={`/p/${p.id}/board`} className="pl-8">
                      <ListChecks className="size-4 text-ink-4" />
                      Board
                      <span className="ml-auto text-xs text-ink-4 tabular-nums">{stats[i].open_actions + stats[i].open_questions}</span>
                    </NavLink>
                    <NavLink href={`/p/${p.id}/decisions`} className="pl-8">
                      <Gavel className="size-4 text-ink-4" />
                      Decisions
                      <span className="ml-auto text-xs text-ink-4 tabular-nums">{stats[i].decisions}</span>
                    </NavLink>
                  </ProjectGroup>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 flex flex-col gap-2 border-t border-hairline">
          <NavLink href="/clients" className="text-[13px] h-7">
            <Briefcase className="size-3.5 text-ink-4" />
            Clients
            <span className="ml-auto text-xs text-ink-4 tabular-nums">{clients.length}</span>
          </NavLink>
          <AboutDialog />
          <NavLink href="/team" className="text-[13px] h-7">
            <Users className="size-3.5 text-ink-4" />
            Team
            <span className="ml-auto text-xs text-ink-4 tabular-nums">{people.length}</span>
          </NavLink>
          <p className="px-1 text-xs text-ink-3 leading-relaxed flex items-center justify-between gap-1.5">
            Shared demo, no sign-in
            {dev && (
              <span className="chip h-5 text-[10px] px-1.5 bg-amber/10 text-amber font-semibold" title="AI calls return predefined output. Open any page with ?dev=no to use the real model.">
                Mock AI
              </span>
            )}
          </p>
          <ResetDemo />
        </div>
      </aside>
    </>
  );
}
