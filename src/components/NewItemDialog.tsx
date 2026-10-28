"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, X } from "lucide-react";
import { createItem } from "@/lib/actions";
import { OwnerMenu } from "./OwnerMenu";
import { Spinner } from "./ui";

type Kind = "action" | "question";

// Add an action or a question on the board by hand, ClickUp "Add task" style. It lands in its group like any other item.
// `kind` presets the switch (the per-section "+ Add"); `compact` renders the small ghost trigger.
export function NewItemDialog({ projectId, team, kind: preset = "action", compact = false }: { projectId: string; team: string[]; kind?: Kind; compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>(preset);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [owner, setOwner] = useState<string | null>(null);
  const [due, setDue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const field = "field h-10 px-3 text-[14px]";
  const lbl = "text-[13px] font-medium text-ink";
  const reset = () => {
    setKind(preset);
    setTitle("");
    setDetail("");
    setOwner(null);
    setDue("");
    setError(null);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    const r = await createItem(projectId, { kind, title, detail: detail || null, owner, due_on: kind === "action" && due ? due : null });
    setBusy(false);
    if (r.ok) {
      setOpen(false);
      reset();
      router.refresh();
    } else setError(r.error);
  };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o, d) => {
        if (o || d.reason !== "outside-press") {
          setOpen(o);
          if (o) reset();
        }
      }}
    >
      {compact ? (
        <Dialog.Trigger className="btn btn-sm btn-ghost text-ink-3" aria-label={`Add ${preset}`}>
          <Plus className="size-3.5" /> Add
        </Dialog.Trigger>
      ) : (
        <Dialog.Trigger className="btn btn-primary btn-lg">
          <Plus className="size-4" /> Add task
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal">
          <div className="px-6 pt-5 pb-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink tracking-[-0.2px]">New {kind}</Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] text-ink-3 leading-relaxed">Added on the board, not from a meeting. It carries into the next meeting like everything else that is open.</Dialog.Description>
            </div>
            <Dialog.Close className="btn btn-ghost btn-icon size-8 -mr-2 -mt-1 text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="flex flex-col">
            <div className="px-6 pb-6 flex flex-col gap-5">
              <div className="inline-flex self-start p-0.5 rounded-md bg-wash" role="radiogroup" aria-label="Kind">
                {(["action", "question"] as Kind[]).map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={`h-7 px-3 rounded-[5px] text-[13px] font-medium capitalize transition-colors duration-100 ${kind === k ? "bg-surface text-ink shadow-[var(--shadow-soft)]" : "text-ink-2 hover:text-ink"}`}>
                    {k}
                  </button>
                ))}
              </div>
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Title <span className="text-red">*</span>
                </span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus placeholder={kind === "action" ? "What needs doing" : "What needs an answer"} className={field} maxLength={300} aria-label="Title" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Description <span className="font-normal text-ink-4">optional</span>
                </span>
                <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} placeholder="Context, links, what done looks like" className="field h-auto py-2 px-3 text-[14px] leading-relaxed resize-y" maxLength={2000} aria-label="Description" />
              </label>
              <div className="flex flex-wrap gap-5">
                <div className="flex flex-col gap-1.5 flex-1 basis-[200px] min-w-0">
                  <span className={lbl}>Owner</span>
                  <div className="field h-10 px-2 flex items-center">
                    <OwnerMenu value={owner} onChange={setOwner} team={team} className="w-full" />
                  </div>
                </div>
                {kind === "action" && (
                  <label className="flex flex-col gap-1.5 w-40">
                    <span className={lbl}>
                      Due date <span className="font-normal text-ink-4">optional</span>
                    </span>
                    <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={field} aria-label="Due date" />
                  </label>
                )}
              </div>
              {error && <p className="text-[13px] text-red">{error}</p>}
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-2 bg-surface-2 border-t border-hairline rounded-b-lg">
              <Dialog.Close className="btn btn-ghost btn-lg">Cancel</Dialog.Close>
              <button className="btn btn-primary btn-lg min-w-28 justify-center" disabled={!title.trim() || busy}>
                {busy && <Spinner />}
                {busy ? "Adding" : `Add ${kind}`}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
