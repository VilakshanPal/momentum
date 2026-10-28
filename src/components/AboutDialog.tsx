"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CircleHelp, X } from "lucide-react";

// Three lines for someone arriving cold: what it is, how the loop works, what the demo is.
export function AboutDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="btn btn-sm btn-ghost w-full justify-start text-ink-2">
        <CircleHelp className="size-3.5 text-ink-4" />
        About MOMentum
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="drawer-backdrop" />
        <Dialog.Popup className="modal">
          <div className="px-6 pt-5 pb-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink tracking-[-0.2px]">MOMentum</Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] text-ink-3 leading-relaxed">Minutes of meeting that carry their own momentum. Built for agencies that run client work through weekly calls.</Dialog.Description>
            </div>
            <Dialog.Close className="btn btn-ghost btn-icon size-8 -mr-2 -mt-1 text-ink-3" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <ol className="px-6 pb-6 flex flex-col gap-4 text-[14px]">
            {[
              ["Notes in", "Paste rough notes or a transcript, or hold the Wispr Flow key and talk. Nothing saves until you approve it."],
              ["Reviewed minutes out", "The AI drafts the summary, decisions, actions and open questions, each with the line it came from. You untick or edit anything, then publish."],
              ["Work carried forward", "Published actions and questions live on the board. Whatever is still open carries into the next meeting, and the follow-up is drafted from what was published."],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-3">
                <span className="size-6 shrink-0 rounded-full bg-wash text-ink-2 text-[12px] font-semibold grid place-items-center">{i + 1}</span>
                <span>
                  <span className="font-medium text-ink">{t}</span>
                  <span className="block text-ink-2 leading-relaxed">{b}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="px-6 py-4 bg-surface-2 border-t border-hairline rounded-b-lg text-[13px] text-ink-3 leading-relaxed">
            This is a shared demo with no sign-in. The Aarohi Ceramics project is a synthetic ten-call story; Reset demo data puts it back. Built for the Wispr Flow hackathon, October 2026.
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
