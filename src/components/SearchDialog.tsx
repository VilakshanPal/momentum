"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Briefcase, CalendarDays, Search } from "lucide-react";
import { search } from "@/lib/actions";
import { Kbd, STATUS, fmtDate } from "./ui";

type Hit = { kind: "project" | "meeting" | "item"; id: string; title: string; sub: string; href: string; status?: string };

// Ctrl+K: one box over projects, meetings and board items. Arrow keys move, Enter opens.
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const text = q.trim();
    if (text.length < 2) return; // the list is hidden below two letters; stale hits are replaced by the next search
    timer.current = setTimeout(async () => {
      setBusy(true);
      const r = await search(text);
      setBusy(false);
      if (!r.ok) return;
      const list: Hit[] = [
        ...r.data.projects.map((p) => ({ kind: "project" as const, id: p.id, title: p.name, sub: p.client ? `Project · ${p.client}` : "Project", href: `/p/${p.id}` })),
        ...r.data.meetings.map((m) => ({ kind: "meeting" as const, id: m.id, title: m.title || "Untitled meeting", sub: `Meeting · ${m.project_name} · ${fmtDate(m.held_on)}`, href: `/p/${m.project_id}/m/${m.id}` })),
        ...r.data.items.map((i) => ({ kind: "item" as const, id: i.id, title: i.title, sub: `${i.kind[0].toUpperCase() + i.kind.slice(1)} · ${i.project_name}`, href: `/p/${i.project_id}/${i.kind === "decision" ? "decisions" : "board"}`, status: i.status })),
      ];
      setHits(list);
      setActive(0);
    }, 150);
  }, [q]);

  const go = (h: Hit) => {
    setOpen(false);
    setQ("");
    router.push(h.href);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQ("");
      }}
    >
      <Dialog.Trigger className="relative flex items-center gap-2 px-2 h-8 rounded-sm text-ink-2 transition-colors duration-100 hover:bg-wash hover:text-ink w-full text-left">
        <Search className="size-4 text-ink-4" />
        Search
        <span className="ml-auto inline-flex items-center gap-0.5">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal modal-top p-0">
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <div className="h-12 px-4 flex items-center gap-2.5 border-b border-hairline">
            <Search className="size-4 text-ink-4 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(hits.length - 1, a + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === "Enter" && hits[active]) {
                  e.preventDefault();
                  go(hits[active]);
                }
              }}
              placeholder="Search projects, meetings, decisions, actions and questions"
              aria-label="Search"
              className="flex-1 min-w-0 h-full bg-transparent outline-none text-[15px] placeholder:text-ink-4"
            />
            <Kbd>Esc</Kbd>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-1.5" role="listbox" aria-label="Results">
            {q.trim().length < 2 ? (
              <p className="px-3 py-6 text-[13px] text-ink-3 text-center">Type at least two letters.</p>
            ) : hits.length ? (
              hits.map((h, i) => {
                const s = h.status ? STATUS[h.status] : null;
                return (
                  <button key={h.kind + h.id} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onClick={() => go(h)} className={`w-full flex items-center gap-3 px-3 h-11 rounded-md text-left ${i === active ? "bg-wash" : ""}`}>
                    {s ? <s.Icon className={`size-4 shrink-0 ${s.fg}`} strokeWidth={2.2} /> : h.kind === "project" ? <Briefcase className="size-4 shrink-0 text-ink-4" /> : <CalendarDays className="size-4 shrink-0 text-ink-4" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-ink">{h.title}</span>
                      <span className="block truncate text-xs text-ink-3">{h.sub}</span>
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-6 text-[13px] text-ink-3 text-center">{busy ? "Searching" : `Nothing matches “${q.trim()}”.`}</p>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
