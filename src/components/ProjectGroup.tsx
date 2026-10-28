"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

// Sidebar project group, ClickUp Spaces style: chevron, letter avatar, name; children collapse.
// The current project opens itself whenever the route enters it; other groups keep their own toggle.
const palette = ["bg-sky", "bg-purple", "bg-pink", "bg-orange", "bg-teal", "bg-green"];
const colour = (id: string) => palette[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % palette.length];

export function ProjectGroup({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
  const path = usePathname();
  const active = path === `/p/${id}` || path.startsWith(`/p/${id}/`);
  const [open, setOpen] = useState(active);
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (active) setOpen(true);
  }

  return (
    <div className="flex flex-col gap-px">
      <div className={`flex items-center gap-1.5 pl-1.5 pr-2 h-8 rounded-sm transition-colors duration-100 hover:bg-wash ${active ? "text-ink" : "text-ink-2"}`}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? `Collapse ${name}` : `Expand ${name}`}
          className="size-5 shrink-0 grid place-items-center rounded-xs text-ink-4 hover:bg-wash-2 hover:text-ink-2"
        >
          <ChevronRight className={`size-4 transition-transform duration-150 ease-out motion-reduce:transition-none ${open ? "rotate-90" : ""}`} />
        </button>
        <Link href={`/p/${id}`} className="flex items-center gap-2 min-w-0 flex-1 h-full" title={name}>
          <span className={`size-5 shrink-0 rounded-[5px] grid place-items-center text-[11px] font-bold text-white ${colour(id)}`}>{name.trim().charAt(0).toUpperCase() || "P"}</span>
          <span className="truncate text-[14px] font-medium">{name}</span>
        </Link>
      </div>
      {open && <div className="flex flex-col gap-px">{children}</div>}
    </div>
  );
}
