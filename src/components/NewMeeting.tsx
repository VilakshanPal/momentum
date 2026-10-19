"use client";

import { useState } from "react";
import { createMeeting } from "@/lib/actions";

export function NewMeeting({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
  if (!open)
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        New meeting
      </button>
    );
  return (
    <form action={createMeeting.bind(null, projectId)} className="flex items-center gap-2">
      <input name="title" autoFocus required placeholder="Meeting title" className="h-8 px-2.5 rounded-md border border-line-2 outline-none focus:border-ink-3 w-56" />
      <input name="held_on" type="date" defaultValue={today} className="h-8 px-2 rounded-md border border-line-2 outline-none focus:border-ink-3 text-ink-2" />
      <button className="btn btn-primary">Create</button>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
