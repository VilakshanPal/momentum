"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui/react/dialog";
import { Pencil, Plus, X } from "lucide-react";
import { createClient, updateClient } from "@/lib/actions";
import type { Client } from "@/lib/schema";

type Props = {
  client?: Client; // edit when given, create otherwise
  trigger?: "primary" | "icon" | "none"; // none: controlled from elsewhere (the client dropdown)
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  onCreated?: (c: { id: string; brand: string }) => void;
};

// Create or edit one client: brand (what projects group under), contact name, email. Same modal as New project.
export function ClientDialog({ client, trigger = "primary", open: openProp, onOpenChange, onCreated }: Props) {
  const [own, setOwn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = openProp ?? own;
  const setOpen = (o: boolean) => {
    setOwn(o);
    onOpenChange?.(o);
    if (!o) setError(null);
  };
  const field = "field h-10 px-3 text-[14px]";
  const lbl = "text-[13px] font-medium text-ink";
  return (
    <Dialog.Root open={open} onOpenChange={(o, d) => (o || d.reason !== "outside-press") && setOpen(o)}>
      {trigger === "primary" && (
        <Dialog.Trigger className="btn btn-primary btn-lg">
          <Plus className="size-4" /> Add client
        </Dialog.Trigger>
      )}
      {trigger === "icon" && (
        <Dialog.Trigger className="btn btn-ghost btn-icon size-8 text-ink-3" title="Edit" aria-label={`Edit ${client?.brand}`}>
          <Pencil className="size-3.5" />
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal">
          <div className="px-6 pt-5 pb-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink tracking-[-0.2px]">{client ? "Edit client" : "New client"}</Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] text-ink-3 leading-relaxed">Projects group under the brand name. The contact is who the follow-ups go to.</Dialog.Description>
            </div>
            <Dialog.Close className="btn btn-ghost btn-icon size-8 -mr-2 -mt-1 text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <form
            key={client?.id ?? "new"}
            action={async (fd) => {
              const r = client ? await updateClient(client.id, fd) : await createClient(fd);
              if (r.ok) {
                if (!client && r.data) onCreated?.(r.data);
                setOpen(false);
              } else setError(r.error);
            }}
            className="flex flex-col"
          >
            <div className="px-6 pb-6 flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Brand name <span className="text-red">*</span>
                </span>
                <input name="brand" required autoFocus defaultValue={client?.brand ?? ""} placeholder="e.g. Aarohi Ceramics" className={field} maxLength={120} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Contact name <span className="font-normal text-ink-4">optional</span>
                </span>
                <input name="name" defaultValue={client?.name ?? ""} placeholder="Who you deal with" className={field} maxLength={120} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Email <span className="font-normal text-ink-4">optional</span>
                </span>
                <input name="email" type="email" defaultValue={client?.email ?? ""} placeholder="name@company.com" className={field} maxLength={200} />
              </label>
              {error && <p className="text-[13px] text-red">{error}</p>}
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-2 bg-surface-2 border-t border-hairline rounded-b-lg">
              <Dialog.Close className="btn btn-ghost btn-lg">Cancel</Dialog.Close>
              <Save label={client ? "Save" : "Add client"} />
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
