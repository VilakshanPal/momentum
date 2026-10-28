"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Mail, RotateCw } from "lucide-react";
import { makeFollowUp } from "@/lib/actions";
import { CopyButton } from "./CopyButton";
import { Spinner } from "./ui";

// Step one after publishing. The button is the card's primary action; the draft replaces it in place.
export function FollowUp({ meetingId, to, subject }: { meetingId: string; to?: string | null; subject: string }) {
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
    <div className="next-follow">
      {text ? (
        <div className="enter next-follow-drafted">
          <p className="text-[13px] text-ink-3 mb-2 leading-relaxed">Edit, then copy it or open it in your mail app{to ? ` addressed to ${to}` : ""}. Nothing is sent for you.</p>
          <div className="rounded-md border border-hairline overflow-hidden bg-surface-2">
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2.5 text-[13px] leading-relaxed outline-none resize-none bg-transparent" />
            <div className="h-10 px-2 flex items-center gap-1.5 border-t border-hairline">
              <CopyButton text={text} label="Copy" small />
              <a className="btn btn-ghost btn-sm" href={`mailto:${to ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`} title={to ? `Opens your mail app with a draft to ${to}` : "Opens your mail app with the draft; add the recipient there"}>
                <ExternalLink className="size-3" /> Open in email
              </a>
              <button className="btn btn-ghost btn-sm" onClick={run} disabled={pending}>
                {pending ? <Spinner /> : <RotateCw className="size-3" />} Redraft
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col next-follow-empty">
          <p className="text-[13px] text-ink-3 mb-3 leading-relaxed">Write the follow-up from what was published: decisions, who owns what, and what is still open.</p>
          <button className="btn btn-primary btn-lg w-full justify-center" onClick={run} disabled={pending}>
            {pending ? <Spinner /> : <Mail className="size-4" />}
            {pending ? "Drafting" : "Draft follow-up"}
          </button>
        </div>
      )}
      {err && (
        <p className="mt-1.5 text-xs text-red">
          {err}{" "}
          <button className="underline" onClick={run}>
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
