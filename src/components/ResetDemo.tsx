"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { RotateCcw } from "lucide-react";
import { resetDemo } from "@/lib/actions";
import { Spinner } from "./ui";

// Hackathon-only control. Two steps because it wipes the shared workspace for everyone on the link.
export function ResetDemo() {
  const [arm, setArm] = useState(false);
  if (!arm)
    return (
      <button className="btn btn-sm w-full justify-center" onClick={() => setArm(true)}>
        <RotateCcw className="size-3" />
        Reset demo data
      </button>
    );
  return (
    <form action={resetDemo} className="card enter p-2.5 flex flex-col gap-2">
      <p className="text-[12px] text-ink-2 leading-relaxed">Puts the sample workspace back to its starting point, for everyone on this link. Anything added by other visitors goes too.</p>
      <div className="flex gap-1.5">
        <Confirm />
        <button type="button" className="btn btn-sm btn-ghost flex-1 justify-center" onClick={() => setArm(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Confirm() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-sm btn-primary flex-1 justify-center" disabled={pending}>
      {pending ? <Spinner /> : <RotateCcw className="size-3" />}
      {pending ? "Resetting" : "Reset"}
    </button>
  );
}
