"use client";

import { Menu } from "@base-ui/react/menu";
import { Avatar } from "./ui";

const Unassigned = () => <span className="size-6 rounded-full border border-dashed border-hairline-2 shrink-0" />;

// Person dropdown on Base UI Menu, like the status menu: only this project's teammates can be chosen.
// The current value is always listed, even when not a teammate (the model names people from the notes).
export function OwnerMenu({ value, onChange, team, className = "", placeholder = "Unassigned", label = "Owner" }: { value: string | null; onChange: (v: string | null) => void; team: string[]; className?: string; placeholder?: string; label?: string }) {
  const options = [...new Set([...team, ...(value ? [value] : [])])];
  return (
    <Menu.Root>
      <Menu.Trigger
        className={`inline-flex items-center gap-1.5 min-w-0 max-w-full h-8 px-1 -mx-1 rounded-sm outline-none transition-colors duration-100 hover:bg-wash data-popup-open:bg-wash focus-visible:outline-2 focus-visible:outline-primary ${className}`}
        aria-label={value ? `${label}: ${value}. Change ${label.toLowerCase()}` : label === "Owner" ? "Assign an owner" : placeholder}
        title={value ?? placeholder}
      >
        {value ? <Avatar name={value} size={24} /> : <Unassigned />}
        <span className={`truncate min-w-0 pr-0.5 text-[14px] ${value ? "text-ink" : "italic text-ink-4"}`}>{value ?? placeholder}</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4} className="z-[60] outline-none">
          <Menu.Popup className="menu max-h-72 overflow-y-auto">
            <Menu.Item className="menu-item h-9" onClick={() => value && onChange(null)}>
              <Unassigned />
              <span className="italic text-ink-3">{placeholder}</span>
              {!value && <span className="ml-auto text-ink-4 text-xs">current</span>}
            </Menu.Item>
            {options.map((n) => (
              <Menu.Item key={n} className="menu-item h-9" onClick={() => n !== value && onChange(n)}>
                <Avatar name={n} size={22} />
                <span className="truncate">{n}</span>
                {n === value && <span className="ml-auto text-ink-4 text-xs">current</span>}
              </Menu.Item>
            ))}
            <p className="px-2 pt-1.5 pb-1 text-[11px] text-ink-4 border-t border-hairline mt-1">{team.length ? "Teammates of this project. Change them in Project settings." : "No teammates on this project yet. Add them in Project settings."}</p>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
