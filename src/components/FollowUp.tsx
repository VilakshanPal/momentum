"use client";

import { useState, useTransition } from "react";
import { Mail, RotateCw } from "lucide-react";
import { makeFollowUp } from "@/lib/actions";
import { CopyButton } from "./CopyButton";
import { Spinner } from "./ui";

export function FollowUp({ meetingId }: { meetingId: string }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = () => {
    setErr(null);
    start(async () => {
      const r = await makeFollowUp(meetingId);
      if (r.ok) setText(r.data);
      else setErr(r.error);
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Mail className="size-3.5 text-ink-3" />
        <h2 className="text-[13px] font-semibold">Follow-up message</h2>
      </div>
      <p className="text-xs text-ink-3 mb-2 leading-relaxed">Drafted from the published record. Edit, then paste into email or Slack. Nothing is sent for you.</p>
      {text ? (
        <div className="card overflow-hidden fade-in">
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2.5 text-[13px] leading-relaxed outline-none resize-none bg-transparent" />
          <div className="h-10 px-2 flex items-center gap-1.5 border-t border-line bg-paper-2/60">
            <CopyButton text={text} label="Copy" small />
            <button className="btn btn-ghost btn-sm" onClick={run} disabled={pending}>
              {pending ? <Spinner /> : <RotateCw className="size-3" />} Redraft
            </button>
          </div>
        </div>
      ) : (
        <div className="card px-3 py-5 text-center">
          <button className="btn" onClick={run} disabled={pending}>
            {pending ? <Spinner /> : <Mail className="size-3.5" />}
            {pending ? "Drafting…" : "Draft follow-up"}
          </button>
        </div>
      )}
      {err && (
        <p className="mt-1.5 text-xs text-t-red-fg">
          {err}{" "}
          <button className="underline" onClick={run}>
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
