"use client";

import { CalendarDays } from "lucide-react";
import { fmtDate, isOverdue } from "./ui";

// Native date picker behind a text label. Reads as "20 Oct" or "No date"; one click anywhere on it opens the picker.
// closed: the item is done, so a past date is history, not overdue. lg: board row size.
export function DateCell({ value, onChange, className = "", placeholder = "No date", closed = false, lg = false }: { value: string | null; onChange: (v: string | null) => void; className?: string; placeholder?: string; closed?: boolean; lg?: boolean }) {
  const overdue = !closed && isOverdue(value);
  return (
    <span
      title={value ? "Change due date" : "Set due date"}
      className={`relative inline-flex items-center gap-1.5 h-7 rounded-md px-1 -mx-1 hover:bg-wash ${lg ? "text-[14px]" : "text-[13px]"} whitespace-nowrap shrink-0 ${value ? (overdue ? "text-red" : closed ? "text-ink-3" : "text-ink") : placeholder ? "text-ink-4 italic" : "text-ink-3"} ${className}`}
    >
      <CalendarDays className={`shrink-0 ${value ? "size-3.5 opacity-70" : "size-4"}`} />
      {(value || placeholder) && <span>{value ? fmtDate(value, { day: "numeric", month: "short" }) : placeholder}</span>}
      <input
        type="date"
        aria-label="Due date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        // Chrome only opens the calendar when the click lands on the input's own icon; ask for it on any click instead.
        onClick={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch {}
        }}
        className="absolute inset-0 opacity-0 cursor-pointer w-full"
      />
    </span>
  );
}
