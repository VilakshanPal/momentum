"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui/react/dialog";
import { Pencil, Plus, X } from "lucide-react";
import { addPerson, updatePerson } from "@/lib/actions";
import type { Person } from "@/lib/schema";

// Create or edit one teammate: name, email, role. A rename follows through to every project's teammates.
export function PersonDialog({ person }: { person?: Person }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const field = "field h-10 px-3 text-[14px]";
  const lbl = "text-[13px] font-medium text-ink";
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o, d) => {
        if (o || d.reason !== "outside-press") {
          setOpen(o);
          if (!o) setError(null);
        }
      }}
    >
      {person ? (
        <Dialog.Trigger className="btn btn-ghost btn-icon size-8 text-ink-3" title="Edit" aria-label={`Edit ${person.name}`}>
          <Pencil className="size-3.5" />
        </Dialog.Trigger>
      ) : (
        <Dialog.Trigger className="btn btn-primary btn-lg">
          <Plus className="size-4" /> Add teammate
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal">
          <div className="px-6 pt-5 pb-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink tracking-[-0.2px]">{person ? "Edit teammate" : "New teammate"}</Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] text-ink-3 leading-relaxed">Teammates are picked per project and offered as owners and participants.</Dialog.Description>
            </div>
            <Dialog.Close className="btn btn-ghost btn-icon size-8 -mr-2 -mt-1 text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <form
            key={person?.name ?? "new"}
            action={async (fd) => {
              const r = person ? await updatePerson(person.name, fd) : await addPerson(fd);
              if (r.ok) setOpen(false);
              else setError(r.error);
            }}
            className="flex flex-col"
          >
            <div className="px-6 pb-6 flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Full name <span className="text-red">*</span>
                </span>
                <input name="name" required autoFocus defaultValue={person?.name ?? ""} className={field} maxLength={80} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Email <span className="font-normal text-ink-4">optional</span>
                </span>
                <input name="email" type="email" defaultValue={person?.email ?? ""} placeholder="name@company.com" className={field} maxLength={200} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Role <span className="font-normal text-ink-4">optional</span>
                </span>
                <input name="role" defaultValue={person?.role ?? ""} placeholder="e.g. Design, Dev, CRM" className={field} maxLength={80} />
              </label>
              {error && <p className="text-[13px] text-red">{error}</p>}
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-2 bg-surface-2 border-t border-hairline rounded-b-lg">
              <Dialog.Close className="btn btn-ghost btn-lg">Cancel</Dialog.Close>
              <Save label={person ? "Save" : "Add teammate"} />
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-lg min-w-24 justify-center" disabled={pending}>
      {pending ? "Saving" : label}
    </button>
  );
}
