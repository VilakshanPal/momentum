"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarDays, MessageSquare, Send, X } from "lucide-react";
import { addComment, listComments } from "@/lib/actions";
import type { Comment, Item } from "@/lib/schema";
import { DateCell } from "./DateCell";
import { OwnerMenu } from "./OwnerMenu";
import { StatusMenu } from "./StatusMenu";
import { Avatar, Kbd, Spinner, fmtDate } from "./ui";

type Patch = Parameters<typeof import("@/lib/actions").updateItem>[1];

// ClickUp-style task view: a wide pop-up. Left, the record and its properties, all editable in place; right, the comments.
// Outside clicks do not close it (edits save as you go, but a half-written comment would be lost).
export function ItemModal({ open, onOpenChange, item, patch, projectId, team }: { open: boolean; onOpenChange: (o: boolean) => void; item: Item; patch: (p: Patch) => void; projectId: string; team: string[] }) {
  const action = item.kind === "action";
  const label = { action: "Action", question: "Question", decision: "Decision" }[item.kind];
  const bodyRef = useRef<HTMLDivElement>(null); // focus lands on the content, not on the first control, so nothing lights up on open
  const blurOnEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).blur();
    }
  };
  return (
    <Dialog.Root open={open} onOpenChange={(o, d) => (o || d.reason !== "outside-press") && onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal modal-wide flex flex-col" initialFocus={bodyRef}>
          <div className="h-14 shrink-0 px-5 flex items-center gap-3 border-b border-hairline">
            <StatusMenu kind={item.kind} value={item.status} pill onChange={(s) => patch({ status: s })} />
            <span className="text-[13px] text-ink-3 whitespace-nowrap">{label}</span>
            {item.meeting_id ? (
              <Link href={`/p/${projectId}/m/${item.meeting_id}`} className="min-w-0 inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink max-sm:hidden">
                <CalendarDays className="size-3.5 text-ink-4 shrink-0" />
                <span className="truncate">{item.meeting_title || "Untitled meeting"}</span>
                <span className="shrink-0 text-ink-4">{fmtDate(item.meeting_held_on)}</span>
              </Link>
            ) : (
              <span className="text-[13px] text-ink-4 max-sm:hidden">Added on the board</span>
            )}
            <Dialog.Close className="btn btn-ghost btn-icon size-8 ml-auto text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 min-h-0 grid min-[900px]:grid-cols-[minmax(0,1fr)_360px]">
            {/* The record */}
            <div ref={bodyRef} tabIndex={-1} className="min-w-0 overflow-y-auto px-7 py-6 flex flex-col gap-6 *:shrink-0 outline-none">
              <Dialog.Title className="sr-only">{item.title}</Dialog.Title>
              <textarea
                key={item.id + item.title}
                className="quiet w-full text-[24px] font-bold leading-snug tracking-[-0.5px] resize-none"
                defaultValue={item.title}
                aria-label="Title"
                rows={1}
                onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== item.title && patch({ title: e.target.value.trim() })}
                onKeyDown={blurOnEnter}
              />

              <dl className="grid grid-cols-[108px_minmax(0,1fr)] min-[700px]:grid-cols-[108px_minmax(0,1fr)_108px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 text-[14px]">
                <dt className="h-9 flex items-center text-[13px] text-ink-3">Status</dt>
                <dd className="h-9 flex items-center min-w-0">
                  <StatusMenu kind={item.kind} value={item.status} onChange={(s) => patch({ status: s })} />
                </dd>
                <dt className="h-9 flex items-center text-[13px] text-ink-3">Owner</dt>
                <dd className="h-9 flex items-center min-w-0">
                  <OwnerMenu value={item.owner} onChange={(v) => patch({ owner: v })} team={team} className="w-full" />
                </dd>
                {action && (
                  <>
                    <dt className="h-9 flex items-center text-[13px] text-ink-3">Due date</dt>
                    <dd className="h-9 flex items-center">
                      <DateCell value={item.due_on} onChange={(v) => patch({ due_on: v })} closed={item.status === "done"} lg />
                    </dd>
                    <dt className="min-h-9 py-2 flex items-start text-[13px] text-ink-3">Blocked by</dt>
                    <dd className="min-h-9 py-1 flex items-center min-w-0">
                      <textarea
                        key={item.id + (item.blocker ?? "")}
                        className={`quiet w-full text-[14px] leading-snug resize-none ${item.blocker ? "text-red" : ""}`}
                        placeholder="Nothing"
                        aria-label="Blocked by"
                        rows={1}
                        defaultValue={item.blocker ?? ""}
                        onBlur={(e) => (e.target.value.trim() || null) !== item.blocker && patch({ blocker: e.target.value.trim() || null })}
                        onKeyDown={blurOnEnter}
                      />
                    </dd>
                  </>
                )}
                <dt className="h-9 flex items-center text-[13px] text-ink-3">{item.meeting_id ? "From meeting" : "Added"}</dt>
                <dd className="h-9 flex items-center min-w-0 min-[700px]:col-span-3">
                  {item.meeting_id ? (
                    <Link href={`/p/${projectId}/m/${item.meeting_id}`} className="inline-flex items-center gap-1.5 min-w-0 text-[14px] text-ink hover:text-primary">
                      <CalendarDays className="size-3.5 text-ink-4 shrink-0" />
                      <span className="truncate">{item.meeting_title || "Untitled meeting"}</span>
                      <span className="text-ink-3 shrink-0">{fmtDate(item.meeting_held_on)}</span>
                    </Link>
                  ) : (
                    <span className="text-[14px] text-ink-2">On the board, {fmtDate(item.created_at.slice(0, 10), { day: "numeric", month: "long", year: "numeric" })}</span>
                  )}
                </dd>
              </dl>

              <div className="border-t border-hairline pt-5">
                <p className="text-[13px] font-medium text-ink mb-1.5">Description</p>
                <textarea
                  key={item.id + (item.detail ?? "")}
                  className="quiet w-full text-[14px] text-ink-2 leading-relaxed resize-none min-h-16"
                  defaultValue={item.detail ?? ""}
                  placeholder="Add a description"
                  aria-label="Description"
                  rows={3}
                  onBlur={(e) => (e.target.value.trim() || null) !== item.detail && patch({ detail: e.target.value.trim() || null })}
                />
              </div>

              {item.evidence && (
                <div>
                  <p className="text-[13px] font-medium text-ink mb-1.5">From the notes</p>
                  <p className="evidence text-[13.5px]">“{item.evidence}”</p>
                </div>
              )}
            </div>

            {/* Comments */}
            <Comments itemId={item.id} team={team} open={open} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Comments({ itemId, team, open }: { itemId: string; team: string[]; open: boolean }) {
  const [list, setList] = useState<Comment[] | null>(null);
  const [author, setAuthor] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    let live = true;
    listComments(itemId).then((r) => live && setList(r.ok ? r.data : []));
    return () => {
      live = false;
    };
  }, [open, itemId]);
  const send = () => {
    const text = body.trim();
    if (!text || sending) return;
    setErr(null);
    start(async () => {
      const r = await addComment(itemId, { author, body: text });
      if (r.ok) {
        setList((l) => [...(l ?? []), r.data]);
        setBody("");
        requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "end" }));
      } else setErr(r.error);
    });
  };
  const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <aside className="min-w-0 flex flex-col border-t min-[900px]:border-t-0 min-[900px]:border-l border-hairline bg-surface-2 min-h-[280px]">
      <div className="h-11 shrink-0 px-5 flex items-center gap-2 border-b border-hairline">
        <MessageSquare className="size-3.5 text-ink-3" />
        <span className="text-[13.5px] font-medium">Comments</span>
        {list && list.length > 0 && <span className="text-xs text-ink-4 tabular-nums">{list.length}</span>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {list === null ? (
          <p className="text-[13px] text-ink-4 inline-flex items-center gap-2">
            <Spinner /> Loading
          </p>
        ) : list.length ? (
          list.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              {c.author ? <Avatar name={c.author} size={26} /> : <span className="size-[26px] shrink-0 rounded-full bg-wash-2 grid place-items-center text-ink-3"><MessageSquare className="size-3" /></span>}
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-ink-3 leading-snug">
                  <span className="font-medium text-ink">{c.author ?? "Note"}</span> · {when(c.created_at)}
                </p>
                <p className="text-[14px] text-ink leading-relaxed whitespace-pre-wrap wrap-break-word mt-0.5">{c.body}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="my-auto text-center px-2">
            <p className="text-[14px] font-medium text-ink">No comments yet</p>
            <p className="text-[13px] text-ink-3 mt-1 leading-relaxed">Ask a question, share an update, or note what changed.</p>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="shrink-0 border-t border-hairline p-3 flex flex-col gap-2 bg-surface">
        <div className="flex items-center gap-2 text-[13px] text-ink-3">
          <span className="shrink-0">Comment as</span>
          <OwnerMenu value={author} onChange={setAuthor} team={team} placeholder="Pick a name" label="Comment as" className="min-w-0" />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Write a comment"
          aria-label="Write a comment"
          rows={2}
          maxLength={2000}
          className="field h-auto py-2 px-3 text-[14px] leading-relaxed resize-none w-full"
        />
        {err && <p className="text-xs text-red">{err}</p>}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-4 inline-flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>Enter</Kbd>
          </span>
          <button className="btn btn-primary" onClick={send} disabled={!body.trim() || sending}>
            {sending ? <Spinner /> : <Send className="size-3.5" />}
            Comment
          </button>
        </div>
      </div>
    </aside>
  );
}
