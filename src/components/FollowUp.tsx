"use client";

import { useState, useTransition } from "react";
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
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="label">Follow-up message</h2>
        {text && <CopyButton text={text} label="Copy" small />}
      </div>
      <p className="text-xs text-ink-3 -mt-1 mb-2">Drafted from the published record. Edit, then copy into email or Slack. Nothing is sent automatically.</p>
      {text ? (
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="card w-full px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-line-2 resize-none" />
      ) : (
        <div className="card px-3 py-6 text-center">
          <button className="btn" onClick={run} disabled={pending}>
            {pending && <Spinner />}
            {pending ? "Drafting…" : "Draft follow-up"}
          </button>
        </div>
      )}
      {text && (
        <button className="btn btn-ghost btn-sm mt-1.5" onClick={run} disabled={pending}>
          {pending && <Spinner />} Redraft
        </button>
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
