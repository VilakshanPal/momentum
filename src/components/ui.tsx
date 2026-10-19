import type { ItemStatus } from "@/lib/schema";

const TINT: Record<string, string> = {
  todo: "bg-t-gray-bg text-t-gray-fg",
  in_progress: "bg-t-blue-bg text-t-blue-fg",
  done: "bg-t-green-bg text-t-green-fg",
  blocked: "bg-t-red-bg text-t-red-fg",
  proposed: "bg-t-amber-bg text-t-amber-fg",
  confirmed: "bg-t-green-bg text-t-green-fg",
  superseded: "bg-t-gray-bg text-t-gray-fg line-through",
  open: "bg-t-orange-bg text-t-orange-fg",
  resolved: "bg-t-green-bg text-t-green-fg",
  draft: "bg-t-amber-bg text-t-amber-fg",
  published: "bg-t-green-bg text-t-green-fg",
  decision: "bg-t-purple-bg text-t-purple-fg",
  action: "bg-t-blue-bg text-t-blue-fg",
  question: "bg-t-orange-bg text-t-orange-fg",
};

export const LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
  proposed: "Proposed",
  confirmed: "Confirmed",
  superseded: "Superseded",
  open: "Open",
  resolved: "Resolved",
  draft: "Draft",
  published: "Published",
  decision: "Decision",
  action: "Action",
  question: "Question",
};

export function Pill({ value, className = "" }: { value: ItemStatus | string; className?: string }) {
  return (
    <span className={`inline-flex items-center h-5 px-1.5 rounded text-[11.5px] font-medium whitespace-nowrap ${TINT[value] ?? TINT.todo} ${className}`}>
      {LABEL[value] ?? value}
    </span>
  );
}

export function fmtDate(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(d + (d.length === 10 ? "T00:00:00Z" : "")));
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`spin size-3.5 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-ink-2">{title}</p>
      {hint && <p className="text-xs text-ink-3 mt-1">{hint}</p>}
    </div>
  );
}
