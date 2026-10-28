"use client";

import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { createMeeting } from "@/lib/actions";
import { Spinner } from "./ui";

// One click: the meeting is created with today's date and a default title, and the editor opens. Rename in place there.
export function NewMeeting({ projectId, label = "New meeting", primary = false, size = "" }: { projectId: string; label?: string; primary?: boolean; size?: "" | "btn-lg" }) {
  return (
    <form action={createMeeting.bind(null, projectId)}>
      <Btn label={label} primary={primary} size={size} />
    </form>
  );
}

function Btn({ label, primary, size }: { label: string; primary: boolean; size: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={`btn ${primary ? "btn-primary" : ""} ${size}`} disabled={pending}>
      {pending ? <Spinner /> : <Plus className="size-3.5" />}
      {label}
    </button>
  );
}
