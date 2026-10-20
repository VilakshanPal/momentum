"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import { ITEM_STATUSES, type ItemKind } from "@/lib/schema";
import { Status } from "./ui";

// Status dropdown on Base UI: keyboard navigation, focus handling and dismissal come for free.
// The popup scales out of its trigger (transform-origin from the positioner), 150ms ease-out.
export function StatusMenu({ kind, value, onChange, pill = false }: { kind: ItemKind; value: string; onChange: (s: string) => void; pill?: boolean }) {
  const options = ITEM_STATUSES[kind].filter((s) => s !== "superseded" || s === value);
  return (
    <Menu.Root>
      <Menu.Trigger className="inline-flex items-center gap-1 rounded-sm px-1 -mx-1 outline-none transition-colors duration-100 hover:bg-wash data-popup-open:bg-wash focus-visible:outline-2 focus-visible:outline-primary" aria-label="Change status">
        <Status value={value} pill={pill} />
        <ChevronDown className="size-3 text-ink-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4} className="z-50 outline-none">
          <Menu.Popup className="menu">
            {options.map((s) => (
              <Menu.Item key={s} className="menu-item" onClick={() => s !== value && onChange(s)}>
                <Status value={s} />
                {s === value && <span className="ml-auto text-ink-4 text-xs">current</span>}
              </Menu.Item>
            ))}
            <p className="px-2 pt-1.5 pb-1 text-[11px] text-ink-4 border-t border-hairline mt-1">Set by you, never by the AI.</p>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
