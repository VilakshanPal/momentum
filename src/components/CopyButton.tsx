"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy", small = false }: { text: string; label?: string; small?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`btn ${small ? "btn-sm" : ""}`}
      aria-label={done ? "Copied" : label}
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          window.prompt("Copy:", text);
        }
      }}
    >
      {done ? <Check className="size-3.5 text-green" /> : <Copy className="size-3.5" />}
      <span className={label.length > 6 ? "max-sm:hidden" : ""}>{done ? "Copied" : label}</span>
    </button>
  );
}
