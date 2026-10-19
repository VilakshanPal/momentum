"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updateItem } from "@/lib/actions";
import { ITEM_STATUSES, type Item } from "@/lib/schema";
import { Pill, fmtDate, LABEL } from "./ui";

// One persistent record, editable inline. Used on the board, the open-work rail and the carried-forward panel.
export function ItemRow({ item: initial, projectId, compact = false }: { item: Item; projectId: string; compact?: boolean }) {
  const [item, setItem] = useState(initial);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const patch = (p: Parameters<typeof updateItem>[1]) => {
    const prev = item;
    setItem({ ...item, ...(p as Partial<Item>) });
    setErr(null);
    start(async () => {
      const r = await updateItem(item.id, p);
      if (!r.ok) {
        setItem(prev);
        setErr(r.error);
      } else setItem(r.data);
    });
  };

  const origin = (
    <Link href={`/p/${projectId}/m/${item.meeting_id}`} className="text-ink-3 hover:text-ink hover:underline whitespace-nowrap" title="Originating meeting">
      {item.meeting_title} · {fmtDate(item.meeting_held_on)}
    </Link>
  );

  if (compact)
    return (
      <div className={`px-3 py-2 text-[13px] ${pending ? "opacity-60" : ""}`}>
        <div className="flex items-start gap-2">
          <StatusSelect item={item} onChange={(s) => patch({ status: s })} />
          <span className="flex-1 leading-snug">{item.title}</span>
        </div>
        <div className="mt-1 ml-0.5 flex items-center gap-2 text-xs text-ink-3">
          <span className={item.owner ? "text-ink-2" : "italic"}>{item.owner ?? "Unassigned"}</span>
          {item.kind === "action" && <span className={item.due_on ? "text-ink-2" : "italic"}>· {item.due_on ? fmtDate(item.due_on) : "No date"}</span>}
          <span className="ml-auto">{origin}</span>
        </div>
        {item.blocker && <p className="mt-1 text-xs text-t-red-fg">Blocked: {item.blocker}</p>}
        {err && <p className="mt-1 text-xs text-t-red-fg">{err}</p>}
      </div>
    );

  return (
    <div className={`row-hover grid items-center gap-3 px-3 min-h-11 text-[13px] ${item.kind === "action" ? "grid-cols-[1fr_120px_140px_110px_1fr_170px]" : "grid-cols-[1fr_120px_140px_170px]"} ${pending ? "opacity-60" : ""}`}>
      <input
        className="quiet py-1 font-medium truncate"
        defaultValue={item.title}
        onBlur={(e) => e.target.value.trim() && e.target.value !== item.title && patch({ title: e.target.value.trim() })}
      />
      <StatusSelect item={item} onChange={(s) => patch({ status: s })} />
      <input className={`quiet py-1 ${item.owner ? "" : "italic text-ink-3"}`} placeholder="Unassigned" defaultValue={item.owner ?? ""} onBlur={(e) => (e.target.value.trim() || null) !== item.owner && patch({ owner: e.target.value.trim() || null })} />
      {item.kind === "action" && (
        <>
          <input type="date" className={`quiet py-1 text-[13px] ${item.due_on ? "" : "text-ink-3"}`} value={item.due_on ?? ""} onChange={(e) => patch({ due_on: e.target.value || null })} />
          <input className={`quiet py-1 truncate ${item.blocker ? "text-t-red-fg" : "italic text-ink-3"}`} placeholder="—" defaultValue={item.blocker ?? ""} onBlur={(e) => (e.target.value.trim() || null) !== item.blocker && patch({ blocker: e.target.value.trim() || null })} />
        </>
      )}
      <span className="text-xs truncate text-right">{origin}</span>
      {err && <p className="col-span-full text-xs text-t-red-fg pb-1">{err}</p>}
    </div>
  );
}

export function StatusSelect({ item, onChange }: { item: Pick<Item, "kind" | "status">; onChange: (s: string) => void }) {
  return (
    <span className="relative inline-flex">
      <Pill value={item.status} className="pr-4" />
      <select
        aria-label="Status"
        className="absolute inset-0 opacity-0 cursor-pointer"
        value={item.status}
        onChange={(e) => onChange(e.target.value)}
      >
        {ITEM_STATUSES[item.kind].map((s) => (
          <option key={s} value={s} disabled={s === "superseded"}>
            {LABEL[s]}
          </option>
        ))}
      </select>
      <svg className="absolute right-1 top-1/2 -translate-y-1/2 size-2.5 pointer-events-none opacity-60" viewBox="0 0 10 10">
        <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  );
}
