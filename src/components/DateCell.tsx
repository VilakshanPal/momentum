"use client";

import { CalendarDays } from "lucide-react";
import { fmtDate, isOverdue } from "./ui";

// Native date picker behind a text label. Reads as "20 Oct" or "No date"; click to change.
export function DateCell({ value, onChange, className = "", placeholder = "No date" }: { value: string | null; onChange: (v: string | null) => void; className?: string; placeholder?: string }) {
  const overdue = isOverdue(value);
  return (
    <span className={`relative inline-flex items-center gap-1.5 h-7 rounded-md px-1 -mx-1 hover:bg-wash text-[13px] whitespace-nowrap shrink-0 ${value ? (overdue ? "text-red" : "text-ink") : "text-ink-4 italic"} ${className}`}>
      <CalendarDays className="size-3.5 shrink-0 opacity-70" />
      <span>{value ? fmtDate(value, { day: "numeric", month: "short" }) : placeholder}</span>
      <input type="date" aria-label="Due date" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full" />
    </span>
  );
}
