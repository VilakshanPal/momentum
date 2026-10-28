"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui/react/dialog";
import { Trash2, TriangleAlert, X } from "lucide-react";

// One confirmation for anything destructive: says exactly what goes, in red, and never closes on an outside click.
// `triggerLabel` renders a text button instead of the trash icon; `redirectTo` navigates once the delete has gone through.
export function DeleteDialog({ title, warning, confirmLabel, action, label, triggerLabel, redirectTo }: { title: string; warning: React.ReactNode; confirmLabel: string; action: () => Promise<{ ok: boolean; error?: string }>; label: string; triggerLabel?: string; redirectTo?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={(o, d) => (o || d.reason !== "outside-press") && setOpen(o)}>
      {triggerLabel ? (
        <Dialog.Trigger className="btn btn-ghost btn-lg text-red hover:text-red" aria-label={label}>
          <Trash2 className="size-4" /> {triggerLabel}
        </Dialog.Trigger>
      ) : (
        <Dialog.Trigger className="btn btn-ghost btn-icon size-8 text-ink-3 hover:text-red" title="Delete" aria-label={label}>
          <Trash2 className="size-3.5" />
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal">
          <div className="px-6 pt-5 pb-5 flex items-start gap-3">
            <span className="size-9 shrink-0 rounded-full bg-red/10 text-red grid place-items-center">
              <TriangleAlert className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink tracking-[-0.2px]">{title}</Dialog.Title>
              <Dialog.Description className="mt-1.5 text-[14px] text-ink-2 leading-relaxed">{warning}</Dialog.Description>
              {error && <p className="mt-2 text-[13px] text-red">{error}</p>}
            </div>
            <Dialog.Close className="btn btn-ghost btn-icon size-8 -mr-2 -mt-1 text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <form
            action={async () => {
              const r = await action();
              if (r.ok) {
                setOpen(false);
                if (redirectTo) router.push(redirectTo);
              }
              else setError(r.error ?? "Could not delete.");
            }}
            className="px-6 py-4 flex items-center justify-end gap-2 bg-surface-2 border-t border-hairline rounded-b-lg"
          >
            <Dialog.Close className="btn btn-ghost btn-lg">Cancel</Dialog.Close>
            <Confirm label={confirmLabel} />
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Confirm({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-danger btn-lg" disabled={pending}>
      {pending ? "Deleting" : label}
    </button>
  );
}
