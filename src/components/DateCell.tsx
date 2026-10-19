"use client";

import { fmtDate } from "./ui";

// Native date input that reads as text ("20 Oct" or "No date") until hovered/focused.
export function DateCell({ value, onChange, className = "" }: { value: string | null; onChange: (v: string | null) => void; className?: string }) {
  return (
    <span className={`relative inline-flex items-center h-7 group/date ${className}`}>
      <span className={`quiet pointer-events-none text-[13px] ${value ? "" : "italic text-ink-3"}`}>{value ? fmtDate(value, { day: "numeric", month: "short", year: "numeric" }) : "No date"}</span>
      <input
        type="date"
        aria-label="Due date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full"
      />
    </span>
  );
}
