"use client";

import { Printer } from "lucide-react";

// Print or save as PDF through the browser. The print stylesheet drops the chrome and keeps the record.
export function PrintButton() {
  return (
    <button className="btn btn-ghost btn-icon size-8 text-ink-3" title="Print or save as PDF" aria-label="Print" onClick={() => window.print()}>
      <Printer className="size-3.5" />
    </button>
  );
}
