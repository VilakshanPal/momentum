"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui/react/dialog";
import { Settings, X } from "lucide-react";
import { deleteProject, updateProject } from "@/lib/actions";
import { DeleteDialog } from "./DeleteDialog";
import { plural } from "./ui";
import type { Project } from "@/lib/schema";
import { ClientSelect } from "./ClientSelect";
import { PeoplePicker } from "./PeoplePicker";

// Gear beside New meeting: name, client from the managed list, and the teammates picked from the company team. Same modal as New project.
export function ProjectSettingsDialog({ project, clients, people, counts }: { project: Project; clients: { id: string; brand: string }[]; people: string[]; counts: { meetings: number; records: number } }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<string | null>(project.client_id);
  const [team, setTeam] = useState(project.team);
  const field = "field h-10 px-3 text-[14px]";
  const lbl = "text-[13px] font-medium text-ink";
  return (
    <Dialog.Root open={open} onOpenChange={(o, d) => (o || d.reason !== "outside-press") && setOpen(o)}>
      <Dialog.Trigger className="btn btn-ghost btn-icon size-9 text-ink-3" title="Project settings" aria-label="Project settings">
        <Settings className="size-4" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal">
          <div className="px-6 pt-5 pb-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink tracking-[-0.2px]">Project settings</Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] text-ink-3 leading-relaxed">Teammates are who the participants picker offers on every meeting.</Dialog.Description>
            </div>
            <Dialog.Close className="btn btn-ghost btn-icon size-8 -mr-2 -mt-1 text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <form
            action={async (fd) => {
              const r = await updateProject(project.id, fd);
              if (r.ok) setOpen(false);
              else setError(r.error);
            }}
            className="flex flex-col"
          >
            <div className="px-6 pb-6 flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className={lbl}>
                  Name <span className="text-red">*</span>
                </span>
                <input name="name" required defaultValue={project.name} className={field} maxLength={120} />
              </label>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-client" className={lbl}>
                  Client <span className="font-normal text-ink-4">optional</span>
                </label>
                <ClientSelect id="settings-client" name="client_id" value={client} onChange={setClient} clients={clients} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-team" className={lbl}>
                  Teammates
                </label>
                <PeoplePicker id="settings-team" name="team" value={team} onChange={setTeam} options={people} placeholder="Pick from the team" empty="No one by that name. Add them on the Team page." />
              </div>
              {error && <p className="text-[13px] text-red">{error}</p>}
            </div>
            <div className="px-6 py-4 flex items-center gap-2 bg-surface-2 border-t border-hairline rounded-b-lg">
              <DeleteDialog
                label="Delete project"
                triggerLabel="Delete project"
                title={`Delete ${project.name}?`}
                warning={
                  <>
                    This deletes the project with its <strong>{plural(counts.meetings, "meeting")}</strong> and <strong>{plural(counts.records, "record")}</strong> (decisions, actions, questions and their comments). <strong>This cannot be undone.</strong>
                  </>
                }
                confirmLabel={counts.meetings ? `Delete project and ${plural(counts.meetings, "meeting")}` : "Delete project"}
                action={deleteProject.bind(null, project.id)}
                redirectTo="/"
              />
              <span className="ml-auto" />
              <Dialog.Close className="btn btn-ghost btn-lg">Cancel</Dialog.Close>
              <Save />
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Save() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-lg min-w-20 justify-center" disabled={pending}>
      {pending ? "Saving" : "Save"}
    </button>
  );
}
