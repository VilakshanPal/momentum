"use client";

import { useState } from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, Plus } from "lucide-react";
import { ClientDialog } from "./ClientDialog";

const ADD = "__add_client__";
type Option = { id: string; brand: string };

// Single-select of a client on Base UI Select: No client, the managed list, and "Add a client" pinned at the bottom,
// which opens the New client dialog and selects what was just added. `name` adds a hidden field carrying the id.
export function ClientSelect({ value, onChange, clients, id, name }: { value: string | null; onChange: (v: string | null) => void; clients: Option[]; id?: string; name?: string }) {
  const [adding, setAdding] = useState(false);
  const [extra, setExtra] = useState<Option[]>([]); // added in this session, until the page refreshes the list
  const options = [...clients, ...extra.filter((e) => !clients.some((c) => c.id === e.id))];
  const label = (v: string) => options.find((o) => o.id === v)?.brand ?? "No client";
  return (
    <>
      <Select.Root
        value={value ?? ""}
        onValueChange={(v) => {
          if (v === ADD) setAdding(true);
          else onChange(v || null);
        }}
      >
        <Select.Trigger id={id} className="field h-10 px-3 text-[14px] w-full flex items-center justify-between gap-2 text-left cursor-default data-popup-open:border-primary">
          <Select.Value className={value ? "text-ink" : "text-ink-4"}>{(v: string) => label(v)}</Select.Value>
          <Select.Icon className="text-ink-4">
            <ChevronDown className="size-4" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner side="bottom" align="start" sideOffset={4} alignItemWithTrigger={false} className="z-50 outline-none">
            <Select.Popup className="menu w-[var(--anchor-width)] max-h-72 overflow-y-auto">
              <Select.Item value="" className="menu-item h-9">
                <Select.ItemText className="italic text-ink-3">No client</Select.ItemText>
                <Select.ItemIndicator className="ml-auto text-primary">
                  <Check className="size-4" />
                </Select.ItemIndicator>
              </Select.Item>
              {options.map((c) => (
                <Select.Item key={c.id} value={c.id} className="menu-item h-9">
                  <Select.ItemText className="truncate">{c.brand}</Select.ItemText>
                  <Select.ItemIndicator className="ml-auto text-primary">
                    <Check className="size-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
              {/* Pinned, so it is reachable without scrolling a long list */}
              <div className="sticky -bottom-1 -mx-1 -mb-1 px-1 pb-1 bg-surface border-t border-hairline mt-1">
                <Select.Item value={ADD} className="menu-item h-9 text-primary">
                  <Plus className="size-4" />
                  <Select.ItemText>Add a client</Select.ItemText>
                </Select.Item>
              </div>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <ClientDialog
        trigger="none"
        open={adding}
        onOpenChange={setAdding}
        onCreated={(c) => {
          setExtra((x) => [...x, c]);
          onChange(c.id);
        }}
      />
    </>
  );
}
