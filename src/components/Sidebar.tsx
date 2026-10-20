import Link from "next/link";
import { Briefcase, CalendarDays, Gavel, ListChecks, Plus, RotateCcw } from "lucide-react";
import { listProjects, projectStats } from "@/lib/data";
import { resetDemo } from "@/lib/actions";
import { NavLink } from "./NavLink";

export async function Sidebar() {
  const projects = await listProjects();
  const stats = await Promise.all(projects.map((p) => projectStats(p.id)));

  return (
    <aside className="w-60 shrink-0 h-full bg-canvas border-r border-hairline flex flex-col text-[13.5px]">
      <div className="h-12 px-3 flex items-center gap-2">
        <span className="size-6 rounded-md bg-ink text-surface grid place-items-center text-[12px] font-bold tracking-tight">M</span>
        <span className="font-semibold text-ink tracking-[-0.1px]">MOMentum</span>
        <span className="ml-auto chip h-5 text-[10.5px] px-1.5 bg-primary-soft text-primary font-semibold">Demo</span>
      </div>

      <div className="px-3 mt-3 mb-1 flex items-center justify-between">
        <span className="eyebrow">Projects</span>
        <Link href="/new-project" className="size-5 grid place-items-center rounded-xs text-ink-4 hover:text-ink hover:bg-wash transition-colors duration-100" title="New project">
          <Plus className="size-3.5" />
        </Link>
      </div>

      <nav className="px-2 flex flex-col gap-0.5 overflow-y-auto">
        {projects.map((p, i) => (
          <div key={p.id} className="flex flex-col gap-px">
            <NavLink href={`/p/${p.id}`} plain className="font-medium text-ink">
              <Briefcase className="size-4 text-ink-4" />
              <span className="truncate">{p.name}</span>
            </NavLink>
            <div className="ml-3 pl-2 border-l border-hairline flex flex-col gap-px">
              <NavLink href={`/p/${p.id}`} exact>
                <CalendarDays className="size-3.5 text-ink-4" />
                Meetings
                <span className="ml-auto text-xs text-ink-4 tabular-nums">{stats[i].meetings}</span>
              </NavLink>
              <NavLink href={`/p/${p.id}/board`}>
                <ListChecks className="size-3.5 text-ink-4" />
                Board
                <span className="ml-auto text-xs text-ink-4 tabular-nums">{stats[i].open_actions + stats[i].open_questions}</span>
              </NavLink>
              <NavLink href={`/p/${p.id}/decisions`}>
                <Gavel className="size-3.5 text-ink-4" />
                Decisions
                <span className="ml-auto text-xs text-ink-4 tabular-nums">{stats[i].decisions}</span>
              </NavLink>
            </div>
          </div>
        ))}
        {!projects.length && <p className="px-2 py-1 text-ink-4">No projects yet.</p>}
      </nav>

      <div className="mt-auto p-3">
        <p className="text-[12px] text-ink-4 leading-relaxed">Public demo. No sign-in. Synthetic data, shared with everyone on this link.</p>
        <form action={resetDemo} className="mt-2">
          <button className="btn btn-sm w-full justify-center">
            <RotateCcw className="size-3" />
            Reset demo data
          </button>
        </form>
      </div>
    </aside>
  );
}
