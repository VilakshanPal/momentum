"use client";

import { useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import { Sparkles, X } from "lucide-react";
import { createSampleMeeting } from "@/lib/actions";
import { Spinner } from "./ui";

// One click for a first-time visitor: new meeting, sample notes typed in, draft generated. Nothing is published.
export function TryDemo({ projectId, size = "" }: { projectId: string; size?: "" | "btn-lg" }) {
  return (
    <form action={createSampleMeeting.bind(null, projectId)}>
      <Btn size={size} />
    </form>
  );
}

function Btn({ size }: { size: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={`btn btn-primary ${size}`} disabled={pending} title="Opens a new meeting, types in sample notes and generates the draft for you. Nothing is published until you say so.">
      {pending ? <Spinner /> : <Sparkles className="size-4" />}
      Try it with sample notes
    </button>
  );
}

const KEY = "momentum.welcome.dismissed";

// Front door: one line on what the product does and the one primary action. Dismissed with the X, remembered per browser.
export function Welcome({ projectId, hasSample }: { projectId: string; hasSample: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  // Hidden on the server and until hydration, so a returning visitor never sees it flash in.
  const stored = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return localStorage.getItem(KEY) === "1";
      } catch {
        return false;
      }
    },
    () => true,
  );
  if (stored || dismissed) return null;
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };
  return (
    <div className="enter mb-8 min-h-14 rounded-lg bg-primary-soft px-4 sm:px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-3">
      <p className="text-[15px] text-ink flex-1 basis-[320px] min-w-0 leading-snug">
        {hasSample ? (
          <>
            Paste rough meeting notes. Get decisions, actions and a follow-up. <span className="text-ink-2">Nothing saves until you approve.</span>
          </>
        ) : (
          <>
            All ten sample meetings are in, kickoff to handover. <span className="text-ink-2">Reset demo data in the sidebar to run the story again, or start a meeting of your own.</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-1.5">
        {hasSample && <TryDemo projectId={projectId} size="btn-lg" />}
        <button className="btn btn-ghost btn-icon size-8 text-ink-3" onClick={dismiss} aria-label="Dismiss" title="Hide this">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
