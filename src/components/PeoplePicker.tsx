"use client";

import { useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";
import { Avatar } from "./ui";

// Multi-select of people on Base UI Combobox: chips with avatars in the field, type to filter, tick on selected rows.
// Options are the project team plus names seen in this project's notes and drafts; anything already selected is always listed.
// `name` adds a hidden field carrying the selection as JSON, for plain form actions.
export function PeoplePicker({ value, onChange, options, id, name, placeholder = "Pick who was there", empty = "No one by that name. Pick teammates in Project settings, or add people on the Team page." }: { value: string[]; onChange: (v: string[]) => void; options: string[]; id?: string; name?: string; placeholder?: string; empty?: string }) {
  const items = [...new Set([...options, ...value])].sort((a, b) => a.localeCompare(b));
  const [query, setQuery] = useState("");
  return (
    <Combobox.Root
      multiple
      items={items}
      value={value}
      onValueChange={(v) => {
        onChange(v as string[]);
        setQuery(""); // a pick clears the filter so the next name is one keystroke away
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      openOnInputClick
    >
      <Combobox.Chips className="picker">
        <Combobox.Value>
          {(selected: string[]) => (
            <>
              {selected.map((name) => (
                <Combobox.Chip key={name} className="chip h-7 pl-1 pr-1 gap-1.5 text-[13px] text-ink bg-wash" aria-label={name}>
                  <Avatar name={name} size={18} />
                  <span className="max-w-[160px] truncate">{name}</span>
                  <Combobox.ChipRemove className="size-5 grid place-items-center rounded-full text-ink-3 hover:bg-wash-2 hover:text-ink" aria-label={`Remove ${name}`}>
                    <X className="size-3" />
                  </Combobox.ChipRemove>
                </Combobox.Chip>
              ))}
              <Combobox.Input id={id} placeholder={selected.length ? "Add more" : placeholder} className="flex-1 min-w-[140px] h-7 bg-transparent text-[14px] placeholder:text-ink-4" />
            </>
          )}
        </Combobox.Value>
        <Combobox.Trigger className="ml-auto size-7 grid place-items-center rounded-sm text-ink-4 hover:bg-wash hover:text-ink-2" aria-label="Open the people list">
          <ChevronDown className="size-4" />
        </Combobox.Trigger>
      </Combobox.Chips>
      <Combobox.Portal>
        <Combobox.Positioner side="bottom" align="start" sideOffset={4} className="z-50 outline-none">
          <Combobox.Popup className="menu w-[var(--anchor-width)] max-h-72 overflow-y-auto">
            <Combobox.Empty className="px-2 py-2 text-[13px] text-ink-3">{empty}</Combobox.Empty>
            <Combobox.List>
              {(name: string) => (
                <Combobox.Item key={name} value={name} className="menu-item h-9 data-[selected]:text-ink">
                  <Avatar name={name} size={22} />
                  <span className="truncate">{name}</span>
                  <Combobox.ItemIndicator className="ml-auto text-primary">
                    <Check className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
      {name && <input type="hidden" name={name} value={JSON.stringify(value)} />}
    </Combobox.Root>
  );
}
