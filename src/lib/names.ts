import type { Draft } from "./schema";

// People are named in notes the way people talk ("Rohan"), while the team holds full names ("Rohan Verma").
// Resolve a name against the known list: exact match ignoring case and any parenthetical, else a first-name match when it is unique.
const core = (s: string) => s.replace(/\s*\(.*?\)\s*/g, "").trim();
const first = (s: string) => core(s).split(/\s+/)[0]?.toLowerCase() ?? "";

export function resolveName(name: string, known: string[]): string {
  const n = core(name);
  if (!n) return name;
  const exact = known.find((k) => core(k).toLowerCase() === n.toLowerCase());
  if (exact) return core(exact);
  if (n.includes(" ")) return name; // already a full name the team does not know; leave it
  const byFirst = known.filter((k) => first(k) === n.toLowerCase());
  if (byFirst.length === 1) return core(byFirst[0]);
  // Misspelt ("Rohann", "Preya"): one edit away from exactly one known first name. Short names stay as typed, too easy to confuse.
  // ponytail: distance 1 on first names only; a real typo model if the team gets names one letter apart (Rachit, Ruchit).
  if (n.length < 5 || byFirst.length) return name;
  const near = known.filter((k) => within1(first(k), n.toLowerCase()));
  return near.length === 1 ? core(near[0]) : name;
}

// True when a and b differ by at most one insertion, deletion or substitution.
function within1(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const [ra, rb] = [a.slice(i), b.slice(i)];
  return ra.slice(1) === rb.slice(1) || ra.slice(1) === rb || ra === rb.slice(1);
}

export function resolveDraftNames<T extends Pick<Draft, "participants" | "actions" | "questions">>(draft: T, known: string[]): T {
  const r = (s: string | null) => (s ? resolveName(s, known) : s);
  return {
    ...draft,
    participants: [...new Set(draft.participants.map((p) => resolveName(p, known)))],
    actions: draft.actions.map((a) => ({ ...a, owner: r(a.owner) })),
    questions: draft.questions.map((q) => ({ ...q, owner: r(q.owner) })),
  };
}
