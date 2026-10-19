"use client";

import { useState } from "react";

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
      {done ? "Copied" : label}
    </button>
  );
}
