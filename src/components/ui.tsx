import { Circle, CircleCheck, CircleDashed, CircleDot, CircleHelp, CircleSlash, CircleX, PenLine, type LucideIcon } from "lucide-react";
import type { ItemStatus } from "@/lib/schema";

// ---- status: icon + label, Linear/ClickUp style ----

export const STATUS: Record<string, { label: string; Icon: LucideIcon; fg: string; bg: string }> = {
  todo: { label: "To do", Icon: Circle, fg: "text-ink-3", bg: "bg-wash" },
  in_progress: { label: "In progress", Icon: CircleDot, fg: "text-primary", bg: "bg-primary/12" },
  done: { label: "Done", Icon: CircleCheck, fg: "text-green", bg: "bg-green/10" },
  blocked: { label: "Blocked", Icon: CircleX, fg: "text-red", bg: "bg-red/10" },
  proposed: { label: "Proposed", Icon: CircleDashed, fg: "text-amber", bg: "bg-amber/10" },
  confirmed: { label: "Confirmed", Icon: CircleCheck, fg: "text-green", bg: "bg-green/10" },
  superseded: { label: "Superseded", Icon: CircleSlash, fg: "text-ink-4", bg: "bg-wash" },
  open: { label: "Open", Icon: CircleHelp, fg: "text-orange", bg: "bg-orange/10" },
  resolved: { label: "Resolved", Icon: CircleCheck, fg: "text-green", bg: "bg-green/10" },
  draft: { label: "Draft", Icon: PenLine, fg: "text-amber", bg: "bg-amber/10" },
  published: { label: "Published", Icon: CircleCheck, fg: "text-green", bg: "bg-green/10" },
};

export function Status({ value, pill = false, className = "" }: { value: ItemStatus | string; pill?: boolean; className?: string }) {
  const s = STATUS[value] ?? STATUS.todo;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-ink ${pill ? `h-6 pl-1.5 pr-2 rounded-full ${s.bg} text-xs font-medium` : "text-[13px]"} ${className}`}>
      <s.Icon className={`size-3.5 shrink-0 ${s.fg}`} strokeWidth={2.2} />
      {s.label}
    </span>
  );
}

// Group header pill, ClickUp list view style: tinted background, solid text and icon, uppercase.
// Stronger tint than the inline Status pill: white on green or orange fails contrast, so the colour goes in the fill, not the text.
const PILL_TINT: Record<string, string> = { todo: "bg-wash-2", in_progress: "bg-primary/15", done: "bg-green/15", blocked: "bg-red/15", open: "bg-orange/15", resolved: "bg-green/15" };
export function StatusPill({ value }: { value: string }) {
  const s = STATUS[value] ?? STATUS.todo;
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-[5px] text-[12px] font-bold uppercase tracking-[0.5px] whitespace-nowrap ${PILL_TINT[value] ?? s.bg} ${s.fg}`}>
      <s.Icon className="size-3.5" strokeWidth={2.4} />
      {s.label}
    </span>
  );
}

// ---- avatars: stable colour per name ----

const PALETTE = [
  ["bg-sky/20", "text-primary"],
  ["bg-green/15", "text-green"],
  ["bg-purple/12", "text-purple"],
  ["bg-amber/15", "text-amber"],
  ["bg-orange/12", "text-orange"],
  ["bg-teal/15", "text-teal"],
  ["bg-pink/12", "text-pink"],
];

export function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

// Grapheme-safe: "Dana 🦄" gives "D🦄", not a broken surrogate half. Emails use the part before the @.
export function initials(name: string, letters: 1 | 2 = 2) {
  const clean = name.replace(/\(.*?\)/g, "").split("@")[0].trim();
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  const first = (s: string | undefined) => (s ? Array.from(s)[0] : "");
  const two = [first(parts[0]), first(parts[1])].slice(0, letters).join("");
  return two.toUpperCase() || "?";
}

export function Avatar({ name, size = 22, letters = 2, className = "" }: { name: string; size?: number; letters?: 1 | 2; className?: string }) {
  const [bg, fg] = avatarColor(name);
  return (
    <span
      title={name}
      className={`inline-grid place-items-center rounded-full font-semibold shrink-0 ${bg} ${fg} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initials(name, letters)}
    </span>
  );
}

export function Person({ name, muted = false }: { name: string | null; muted?: boolean }) {
  if (!name) return <span className={`text-[13px] italic ${muted ? "text-ink-3" : "text-ink-3"}`}>Unassigned</span>;
  const shown = name.replace(/\s*\(.*?\)\s*/g, "");
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink min-w-0 max-w-full" title={name}>
      <Avatar name={name} size={20} />
      <span className="truncate">{shown}</span>
    </span>
  );
}

export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((n, i) => (
        <Avatar key={n} name={n} size={24} letters={1} className={`ring-2 ring-surface ${i ? "-ml-1.5" : ""}`} />
      ))}
      {rest > 0 && <span className="-ml-2 size-6 rounded-full bg-wash-2 text-ink-2 text-[10px] font-medium grid place-items-center ring-2 ring-surface">+{rest}</span>}
    </span>
  );
}

// Board column templates. Kept here (no "use client") so server components get the string, not a client reference.
// Name takes the remaining width. The blocker lives under the name, not in a column. From meeting hides below 1200px (cells carry `max-[1200px]:hidden`).
export const ACTION_COLS = "grid-cols-[minmax(0,1fr)_130px_110px] min-[1200px]:grid-cols-[minmax(0,1fr)_150px_120px_200px]";
export const QUESTION_COLS = "grid-cols-[minmax(0,1fr)_130px] min-[1200px]:grid-cols-[minmax(0,1fr)_150px_200px]";

// ---- misc ----

export function fmtDate(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(d + (d.length === 10 ? "T00:00:00Z" : "")));
}

export const plural = (n: number, word: string) => `${n.toLocaleString("en-GB")} ${word}${n === 1 ? "" : "s"}`;

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
        <span className="size-9 rounded-lg bg-wash grid place-items-center text-ink-4">
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
  return <kbd className="inline-grid place-items-center h-5 min-w-5 px-1 rounded-xs border border-hairline-2 bg-surface-2 text-[11px] text-ink-2 font-sans">{children}</kbd>;
}
