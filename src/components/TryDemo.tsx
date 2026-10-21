"use client";

import { useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";
import { createSampleMeeting } from "@/lib/actions";
import { Spinner } from "./ui";

// One click for a first-time visitor: new meeting, sample notes typed in, draft generated. Nothing is published.
export function TryDemo({ projectId }: { projectId: string }) {
  return (
    <form action={createSampleMeeting.bind(null, projectId)}>
      <Btn />
    </form>
  );
}

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" disabled={pending} title="Opens a new meeting, types in sample notes and generates the draft for you. Nothing is published until you say so.">
      {pending ? <Spinner /> : <Sparkles className="size-3.5 text-primary" />}
      Try it with sample notes
    </button>
  );
}
