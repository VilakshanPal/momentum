"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createProject } from "@/lib/actions";
import { ClientSelect } from "./ClientSelect";
import { PeoplePicker } from "./PeoplePicker";

// Shared by the sidebar modal and the no-project fallback page.
// `clients` is the managed client list; `people` is the company team the teammates picker offers.
function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-lg min-w-24 justify-center" disabled={disabled || pending}>
      {pending ? "Creating" : "Create project"}
    </button>
  );
}

export function NewProjectForm({ clients = [], people = [], onCancel }: { clients?: { id: string; brand: string }[]; people?: string[]; onCancel?: () => void }) {
  const [name, setName] = useState("");
  const [client, setClient] = useState<string | null>(null);
  const [team, setTeam] = useState<string[]>([]);
  const field = "field h-10 px-3 text-[14px]";
  const lbl = "text-[13px] font-medium text-ink";
  return (
    <form action={createProject} className="flex flex-col">
      <div className="px-6 pb-6 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className={lbl}>
            Name <span className="text-red">*</span>
          </span>
          <input name="name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="What you are building, e.g. Website redesign" className={field} maxLength={120} />
        </label>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-client" className={lbl}>
            Client <span className="font-normal text-ink-4">optional</span>
          </label>
          <ClientSelect id="project-client" name="client_id" value={client} onChange={setClient} clients={clients} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-team" className={lbl}>
            Teammates <span className="font-normal text-ink-4">optional</span>
          </label>
          <PeoplePicker id="project-team" name="team" value={team} onChange={setTeam} options={people} placeholder="Pick from the team" empty="No one by that name. Add them on the Team page." />
        </div>
      </div>
      <div className="px-6 py-4 flex items-center justify-end gap-2 bg-surface-2 border-t border-hairline rounded-b-lg">
        {onCancel && (
          <button type="button" className="btn btn-ghost btn-lg" onClick={onCancel}>
            Cancel
          </button>
        )}
        <Submit disabled={!name.trim()} />
      </div>
    </form>
  );
}
