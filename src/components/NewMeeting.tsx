"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createMeeting } from "@/lib/actions";

export function NewMeeting({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");
  if (!open)
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        New meeting
      </button>
    );
  return (
    <form action={createMeeting.bind(null, projectId)} className="flex items-center gap-2 fade-in">
      <input name="title" autoFocus required placeholder="Meeting title" className="h-8 px-2.5 rounded-md border border-line-2 outline-none focus:border-ink-3 w-56 text-[13px]" />
      <input name="held_on" type="date" defaultValue={today} className="h-8 px-2 rounded-md border border-line-2 outline-none focus:border-ink-3 text-ink-2 text-[13px]" />
      <button className="btn btn-primary">Create</button>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
