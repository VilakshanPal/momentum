import { Circle, CircleCheck, CircleDashed, CircleDot, CircleHelp, CircleSlash, CircleX, PenLine, type LucideIcon } from "lucide-react";
import type { ItemStatus } from "@/lib/schema";

// ---- status: icon + label, Linear/ClickUp style ----

export const STATUS: Record<string, { label: string; Icon: LucideIcon; fg: string; bg: string }> = {
  todo: { label: "To do", Icon: Circle, fg: "text-t-gray-fg", bg: "bg-t-gray-bg" },
  in_progress: { label: "In progress", Icon: CircleDot, fg: "text-t-blue-fg", bg: "bg-t-blue-bg" },
  done: { label: "Done", Icon: CircleCheck, fg: "text-t-green-fg", bg: "bg-t-green-bg" },
  blocked: { label: "Blocked", Icon: CircleX, fg: "text-t-red-fg", bg: "bg-t-red-bg" },
  proposed: { label: "Proposed", Icon: CircleDashed, fg: "text-t-amber-fg", bg: "bg-t-amber-bg" },
  confirmed: { label: "Confirmed", Icon: CircleCheck, fg: "text-t-green-fg", bg: "bg-t-green-bg" },
  superseded: { label: "Superseded", Icon: CircleSlash, fg: "text-t-gray-fg", bg: "bg-t-gray-bg" },
  open: { label: "Open", Icon: CircleHelp, fg: "text-t-orange-fg", bg: "bg-t-orange-bg" },
  resolved: { label: "Resolved", Icon: CircleCheck, fg: "text-t-green-fg", bg: "bg-t-green-bg" },
  draft: { label: "Draft", Icon: PenLine, fg: "text-t-amber-fg", bg: "bg-t-amber-bg" },
  published: { label: "Published", Icon: CircleCheck, fg: "text-t-green-fg", bg: "bg-t-green-bg" },
};

export function Status({ value, pill = false, className = "" }: { value: ItemStatus | string; pill?: boolean; className?: string }) {
  const s = STATUS[value] ?? STATUS.todo;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap ${pill ? `h-6 px-2 rounded-full ${s.bg} ${s.fg} text-xs font-medium` : "text-ink"} ${className}`}>
      <s.Icon className={`size-3.5 shrink-0 ${s.fg}`} strokeWidth={2.2} />
      {s.label}
    </span>
  );
}

// ---- avatars: stable colour per name ----

const PALETTE = [
  ["bg-t-blue-bg", "text-t-blue-fg"],
  ["bg-t-green-bg", "text-t-green-fg"],
  ["bg-t-purple-bg", "text-t-purple-fg"],
  ["bg-t-amber-bg", "text-t-amber-fg"],
  ["bg-t-orange-bg", "text-t-orange-fg"],
  ["bg-t-teal-bg", "text-t-teal-fg"],
  ["bg-t-red-bg", "text-t-red-fg"],
];

export function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initials(name: string) {
  const clean = name.replace(/\(.*?\)/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Avatar({ name, size = 22, className = "" }: { name: string; size?: number; className?: string }) {
  const [bg, fg] = avatarColor(name);
  return (
    <span
      title={name}
      className={`inline-grid place-items-center rounded-full font-semibold shrink-0 ${bg} ${fg} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initials(name)}
    </span>
  );
}

export function Person({ name, muted = false }: { name: string | null; muted?: boolean }) {
  if (!name) return <span className={`text-[13px] italic ${muted ? "text-ink-3" : "text-ink-3"}`}>Unassigned</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink min-w-0">
      <Avatar name={name} size={20} />
      <span className="truncate">{name.replace(/\s*\(.*?\)\s*/g, "")}</span>
    </span>
  );
}

export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((n, i) => (
        <Avatar key={n} name={n} size={22} className={`ring-2 ring-paper ${i ? "-ml-1.5" : ""}`} />
      ))}
      {rest > 0 && <span className="-ml-1.5 size-[22px] rounded-full bg-paper-3 text-ink-2 text-[10px] font-medium grid place-items-center ring-2 ring-paper">+{rest}</span>}
    </span>
  );
}

// Board column templates. Kept here (no "use client") so server components get the string, not a client reference.
export const ACTION_COLS = "grid-cols-[minmax(0,1fr)_150px_150px_120px_minmax(0,0.8fr)_180px]";
export const QUESTION_COLS = "grid-cols-[minmax(0,1fr)_150px_150px_180px]";

// ---- misc ----

export function fmtDate(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(d + (d.length === 10 ? "T00:00:00Z" : "")));
}

export function isOverdue(d: string | null | undefined) {
  return !!d && d < new Date().toLocaleDateString("en-CA");
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`spin size-3.5 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Empty({ icon: Icon, title, hint, action }: { icon?: LucideIcon; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="py-10 px-6 text-center flex flex-col items-center gap-2">
      {Icon && (
        <span className="size-9 rounded-lg bg-paper-3 grid place-items-center text-ink-3">
          <Icon className="size-4" />
        </span>
      )}
      <p className="text-ink font-medium">{title}</p>
      {hint && <p className="text-xs text-ink-3 max-w-xs leading-relaxed">{hint}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-grid place-items-center h-5 min-w-5 px-1 rounded border border-line-2 bg-paper-2 text-[11px] text-ink-2 font-sans">{children}</kbd>;
}
