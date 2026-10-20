"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CalendarDays, OctagonAlert } from "lucide-react";
import { updateItem } from "@/lib/actions";
import type { Item } from "@/lib/schema";
import { ACTION_COLS, QUESTION_COLS, Avatar, Person, fmtDate } from "./ui";
import { StatusMenu } from "./StatusMenu";
import { DateCell } from "./DateCell";

// One persistent record with optimistic inline edits. Three presentations share the hook.

type Patch = Parameters<typeof updateItem>[1];

function useItem(initial: Item) {
  const [item, setItem] = useState(initial);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const patch = (p: Patch) => {
    const prev = item;
    setItem({ ...item, ...(p as Partial<Item>) });
    setErr(null);
    start(async () => {
      const r = await updateItem(item.id, p);
      if (!r.ok) {
        setItem(prev);
        setErr(r.error);
      } else setItem({ ...item, ...r.data });
    });
  };
  return { item, patch, err, pending };
}

function Origin({ item, projectId }: { item: Item; projectId: string }) {
  return (
    <Link href={`/p/${projectId}/m/${item.meeting_id}`} className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink whitespace-nowrap" title="Originating meeting">
      <CalendarDays className="size-3" />
      {item.meeting_title} · {fmtDate(item.meeting_held_on)}
    </Link>
  );
}

function OwnerInput({ value, onChange, className = "" }: { value: string | null; onChange: (v: string | null) => void; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      {value ? <Avatar name={value} size={20} /> : <span className="size-5 rounded-full border border-dashed border-hairline-2 shrink-0" />}
      <input
        list="people"
        className={`quiet h-7 w-full text-[13px] ${value ? "" : "italic text-ink-4"}`}
        placeholder="Unassigned"
        defaultValue={value ?? ""}
        onBlur={(e) => (e.target.value.trim() || null) !== value && onChange(e.target.value.trim() || null)}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
    </span>
  );
}

// Compact: rails and panels.
export function OpenItem({ item: initial, projectId }: { item: Item; projectId: string }) {
  const { item, patch, err, pending } = useItem(initial);
  return (
    <div className={`px-3 py-2.5 flex flex-col gap-1.5 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-2">
        <span className="mt-px">
          <StatusMenu kind={item.kind} value={item.status} onChange={(s) => patch({ status: s })} />
        </span>
      </div>
      <p className="text-[13px] leading-snug -mt-1 pl-0.5">{item.title}</p>
      <div className="flex items-center gap-3 text-xs text-ink-3 pl-0.5">
        <Person name={item.owner} muted />
        {item.kind === "action" && <DateCell value={item.due_on} onChange={(v) => patch({ due_on: v })} />}
        <span className="ml-auto">
          <Origin item={item} projectId={projectId} />
        </span>
      </div>
      {item.blocker && (
        <p className="text-xs text-red flex items-start gap-1 pl-0.5">
          <OctagonAlert className="size-3 mt-0.5 shrink-0" /> {item.blocker}
        </p>
      )}
      {err && <p className="text-xs text-red">{err}</p>}
    </div>
  );
}

// Board rows.
export function ActionRow({ item: initial, projectId }: { item: Item; projectId: string }) {
  const { item, patch, err, pending } = useItem(initial);
  return (
    <div className={`row grid ${ACTION_COLS} items-center gap-3 px-3 min-h-10 text-[13px] ${pending ? "opacity-60" : ""}`}>
      <input
        className={`quiet h-7 font-medium truncate ${item.status === "done" ? "text-ink-3 line-through" : ""}`}
        defaultValue={item.title}
        onBlur={(e) => e.target.value.trim() && e.target.value !== item.title && patch({ title: e.target.value.trim() })}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
      <StatusMenu kind="action" value={item.status} onChange={(s) => patch({ status: s })} />
      <OwnerInput value={item.owner} onChange={(v) => patch({ owner: v })} />
      <DateCell value={item.due_on} onChange={(v) => patch({ due_on: v })} />
      <input
        className={`quiet h-7 truncate text-[13px] ${item.blocker ? "text-red" : "text-ink-3"}`}
        placeholder="Nothing"
        defaultValue={item.blocker ?? ""}
        onBlur={(e) => (e.target.value.trim() || null) !== item.blocker && patch({ blocker: e.target.value.trim() || null })}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
      <span className="truncate text-right">
        <Origin item={item} projectId={projectId} />
      </span>
      {err && <p className="col-span-full text-xs text-red pb-1">{err}</p>}
    </div>
  );
}

export function QuestionRow({ item: initial, projectId }: { item: Item; projectId: string }) {
  const { item, patch, err, pending } = useItem(initial);
  return (
    <div className={`row grid ${QUESTION_COLS} items-center gap-3 px-3 min-h-10 text-[13px] ${pending ? "opacity-60" : ""}`}>
      <input
        className={`quiet h-7 font-medium truncate ${item.status === "resolved" ? "text-ink-3" : ""}`}
        defaultValue={item.title}
        onBlur={(e) => e.target.value.trim() && e.target.value !== item.title && patch({ title: e.target.value.trim() })}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
      <StatusMenu kind="question" value={item.status} onChange={(s) => patch({ status: s })} />
      <OwnerInput value={item.owner} onChange={(v) => patch({ owner: v })} />
      <span className="truncate text-right">
        <Origin item={item} projectId={projectId} />
      </span>
      {err && <p className="col-span-full text-xs text-red pb-1">{err}</p>}
    </div>
  );
}

// Datalist of known people, rendered once per page so owner inputs can autocomplete.
export function PeopleList({ people }: { people: string[] }) {
  return (
    <datalist id="people">
      {people.map((p) => (
        <option key={p} value={p.replace(/\s*\(.*?\)\s*/g, "")} />
      ))}
    </datalist>
  );
}
