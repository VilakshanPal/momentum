import Link from "next/link";
import { listProjects } from "@/lib/data";
import { resetDemo } from "@/lib/actions";
import { NavLink } from "./NavLink";

export async function Sidebar() {
  const projects = await listProjects();
  return (
    <aside className="w-[232px] shrink-0 h-full bg-paper-2 border-r border-line flex flex-col text-[13px]">
      <div className="px-3 pt-3 pb-2 flex items-center gap-2">
        <span className="inline-grid place-items-center size-5 rounded bg-ink text-paper text-[11px] font-bold">M</span>
        <span className="font-semibold text-ink">MOMentum</span>
      </div>

      <div className="px-3 mt-3 flex items-center justify-between">
        <span className="label">Projects</span>
        <Link href="/new-project" className="text-ink-3 hover:text-ink hover:bg-paper-3 rounded size-5 grid place-items-center" title="New project">
          +
        </Link>
      </div>
      <nav className="px-1.5 mt-1 flex flex-col gap-px">
        {projects.map((p) => (
          <NavLink key={p.id} href={`/p/${p.id}`}>
            <span className="truncate">{p.name}</span>
          </NavLink>
        ))}
        {!projects.length && <p className="px-2 py-1 text-ink-3">No projects yet.</p>}
      </nav>

      <div className="mt-auto p-3 border-t border-line">
        <p className="text-xs text-ink-3 leading-relaxed">
          Demo workspace. No sign-in. Data is synthetic and shared with everyone viewing this link.
        </p>
        <form action={resetDemo} className="mt-2">
          <button className="btn btn-sm w-full justify-center">Reset demo data</button>
        </form>
      </div>
    </aside>
  );
}
