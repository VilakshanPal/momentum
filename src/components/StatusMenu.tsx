"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ITEM_STATUSES, type ItemKind } from "@/lib/schema";
import { STATUS, Status } from "./ui";

// Custom status dropdown (native selects look like the OS, not the product).
export function StatusMenu({ kind, value, onChange, pill = false }: { kind: ItemKind; value: string; onChange: (s: string) => void; pill?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 rounded-md px-1 -mx-1 hover:bg-paper-3 ${open ? "bg-paper-3" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Status value={value} pill={pill} />
        <ChevronDown className="size-3 text-ink-3" />
      </button>
      {open && (
        <div className="menu top-full mt-1 left-0 fade-in" role="menu">
          {ITEM_STATUSES[kind]
            .filter((s) => s !== "superseded" || s === value)
            .map((s) => (
              <button
                key={s}
                role="menuitem"
                className={`menu-item ${s === value ? "bg-paper-2" : ""}`}
                onClick={() => {
                  setOpen(false);
                  if (s !== value) onChange(s);
                }}
              >
                <Status value={s} />
                {s === value && <span className="ml-auto text-ink-3 text-xs">current</span>}
              </button>
            ))}
          <p className="px-2 pt-1.5 pb-1 text-[11px] text-ink-3 border-t border-line mt-1">{STATUS[value]?.label}: set by you, never by the AI.</p>
        </div>
      )}
    </span>
  );
}
