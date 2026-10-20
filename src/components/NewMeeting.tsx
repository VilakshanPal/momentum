"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createMeeting } from "@/lib/actions";

export function NewMeeting({ projectId, label = "New meeting", primary = true }: { projectId: string; label?: string; primary?: boolean }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");
  if (!open)
    return (
      <button className={`btn ${primary ? "btn-primary" : ""}`} onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        {label}
      </button>
    );
  return (
    <form action={createMeeting.bind(null, projectId)} className="flex items-center gap-2 enter">
      <input name="title" autoFocus required placeholder="Meeting title" className="field w-56" />
      <input name="held_on" type="date" defaultValue={today} className="field px-2 text-ink-2" />
      <button className="btn btn-primary">Create</button>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
