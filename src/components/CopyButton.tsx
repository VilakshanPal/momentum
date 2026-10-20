"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy", small = false }: { text: string; label?: string; small?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`btn ${small ? "btn-sm" : ""}`}
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
      {done ? "Copied" : label}
    </button>
  );
}
