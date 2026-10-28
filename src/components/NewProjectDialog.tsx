"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, X } from "lucide-react";
import { NewProjectForm } from "./NewProjectForm";

// Sidebar plus: opens the create form as a modal over the current page, ClickUp Create List style.
// A click outside never closes a form dialog (an accidental click would throw the form away); Escape, X and Cancel do.
export function NewProjectDialog({ clients, people }: { clients: { id: string; brand: string }[]; people: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={(o, d) => (o || d.reason !== "outside-press") && setOpen(o)}>
      <Dialog.Trigger className="btn btn-ghost btn-icon size-6 text-ink-3" title="New project" aria-label="New project">
        <Plus className="size-4" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal">
          <div className="px-6 pt-5 pb-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink tracking-[-0.2px]">New project</Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] text-ink-3 leading-relaxed">Meetings in a project share decisions and open work, so nothing has to be re-asked.</Dialog.Description>
            </div>
            <Dialog.Close className="btn btn-ghost btn-icon size-8 -mr-2 -mt-1 text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <NewProjectForm clients={clients} people={people} onCancel={() => setOpen(false)} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
