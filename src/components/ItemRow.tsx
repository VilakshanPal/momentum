"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CalendarDays, ListPlus, OctagonAlert } from "lucide-react";
import { updateItem } from "@/lib/actions";
import type { Item } from "@/lib/schema";
import { ACTION_COLS, QUESTION_COLS, Person, fmtDate } from "./ui";
import { StatusMenu } from "./StatusMenu";
import { OwnerMenu } from "./OwnerMenu";
import { ItemModal } from "./ItemModal";
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
  if (!item.meeting_id)
    return (
      <span className="flex items-center gap-1.5 max-w-full min-w-0 text-[13px] text-ink-4" title={`Added on the board, ${fmtDate(item.created_at)}`}>
        <ListPlus className="size-3.5 shrink-0" />
        <span className="truncate">Added on the board</span>
      </span>
    );
  return (
    <Link href={`/p/${projectId}/m/${item.meeting_id}`} className="flex items-center gap-1.5 max-w-full min-w-0 text-[13px] text-ink-3 hover:text-ink" title={`From: ${item.meeting_title || "Untitled meeting"}, ${fmtDate(item.meeting_held_on)}`}>
      <CalendarDays className="size-3.5 shrink-0" />
      <span className="truncate">
        {item.meeting_title || "Untitled meeting"}
        {item.meeting_title?.includes(fmtDate(item.meeting_held_on)) ? "" : ` · ${fmtDate(item.meeting_held_on)}`}
      </span>
    </Link>
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
      <p className="text-[13px] leading-snug -mt-1 pl-0.5 break-words">{item.title}</p>
      {item.detail && <p className="text-xs text-ink-3 leading-snug -mt-0.5 pl-0.5 break-words">{item.detail}</p>}
      <div className="flex items-center gap-3 text-xs text-ink-3 pl-0.5 min-w-0">
        <span className="min-w-0 max-w-[50%] shrink-0 flex">
          <Person name={item.owner} muted />
        </span>
        {item.kind === "action" && <DateCell value={item.due_on} onChange={(v) => patch({ due_on: v })} />}
        <span className="ml-auto min-w-0 flex justify-end">
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

// Board rows, ClickUp list anatomy: status icon, name that wraps to two lines and opens the drawer, owner, date, origin.
export function ActionRow({ item: initial, projectId, team }: { item: Item; projectId: string; team: string[] }) {
  const { item, patch, err, pending } = useItem(initial);
  const [open, setOpen] = useState(false);
  return (
    <div className={`row grid ${ACTION_COLS} items-center gap-3 px-3 min-h-11 text-[14px] ${pending ? "opacity-60" : ""}`}>
      <NameCell item={item} kind="action" onStatus={(s) => patch({ status: s })} onOpen={() => setOpen(true)} />
      <OwnerMenu value={item.owner} onChange={(v) => patch({ owner: v })} team={team} />
      <DateCell value={item.due_on} onChange={(v) => patch({ due_on: v })} placeholder="" closed={item.status === "done"} lg />
      <span className="min-w-0 flex justify-end max-[1200px]:hidden">
        <Origin item={item} projectId={projectId} />
      </span>
      {err && <p className="col-span-full text-xs text-red pb-1">{err}</p>}
      <ItemModal open={open} onOpenChange={setOpen} item={item} patch={patch} projectId={projectId} team={team} />
    </div>
  );
}

export function QuestionRow({ item: initial, projectId, team }: { item: Item; projectId: string; team: string[] }) {
  const { item, patch, err, pending } = useItem(initial);
  const [open, setOpen] = useState(false);
  return (
    <div className={`row grid ${QUESTION_COLS} items-center gap-3 px-3 min-h-11 text-[14px] ${pending ? "opacity-60" : ""}`}>
      <NameCell item={item} kind="question" onStatus={(s) => patch({ status: s })} onOpen={() => setOpen(true)} />
      <OwnerMenu value={item.owner} onChange={(v) => patch({ owner: v })} team={team} />
      <span className="min-w-0 flex justify-end max-[1200px]:hidden">
        <Origin item={item} projectId={projectId} />
      </span>
      {err && <p className="col-span-full text-xs text-red pb-1">{err}</p>}
      <ItemModal open={open} onOpenChange={setOpen} item={item} patch={patch} projectId={projectId} team={team} />
    </div>
  );
}

// Status icon (its own menu button) beside a name button. Two separate controls: a menu trigger cannot live inside a button.
function NameCell({ item, kind, onStatus, onOpen }: { item: Item; kind: "action" | "question"; onStatus: (s: string) => void; onOpen: () => void }) {
  const closed = item.status === "done" || item.status === "resolved";
  return (
    <span className="flex items-start gap-3 min-w-0 py-2.5">
      <span className="-mt-1 shrink-0">
        <StatusMenu kind={kind} value={item.status} iconOnly onChange={onStatus} />
      </span>
      <button type="button" onClick={onOpen} className="flex-1 min-w-0 text-left cursor-pointer rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-primary/40 focus-visible:outline-offset-4 group/name" title={item.title}>
        <span className={`block text-[15px] font-medium leading-[1.4] line-clamp-2 wrap-break-word transition-colors duration-100 group-hover/name:text-primary ${closed ? "text-ink-3 line-through" : "text-ink"}`}>{item.title}</span>
        {item.blocker && <span className="block text-[13px] text-red truncate mt-0.5">{item.blocker}</span>}
        {item.detail && <span className="block text-[13px] text-ink-3 truncate mt-0.5">{item.detail}</span>}
      </button>
    </span>
  );
}

// Side drawer with everything about one record. Edits go through the same patch as the row, so the row updates at once.

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
