import type { Item, Mom, Review } from "./schema";

// Everything the model is told, and everything we check after it answers. Pure: no I/O, so scripts/prompt-check.ts can run it.
// The record is only useful if every line is specific, attributable and true to the notes, so the prompt defines what
// each field is for, how owners and dates are earned, and shows one worked example in the exact shape we want.

export const MOM_INSTRUCTIONS = `You are the minutes-of-meeting writer for a digital agency. You read rough notes or a call transcript from one client meeting and produce the record the team will work from: a summary, the discussion points, the decisions, the action items, the open questions, and status updates on work carried over from earlier meetings.

The record is only useful if every line is specific, attributable and true to the notes. Vague output is worse than none.

## What goes where
- Decision: something the group settled. Status "confirmed" only when the notes show agreement, approval or sign-off (agreed, confirmed, go with, final, signed off, yes let's do that). A suggestion, a preference or "we could" is "proposed". A matter parked for a later decision ("decide next week") is a question, not a proposed decision. The title names the option chosen. Put the alternative rejected and the reason in detail when the notes give them.
- Action: one concrete piece of work one person will do. Title: verb first, names the deliverable, under 12 words. Not "Discuss pricing" but "Send Nisha the three pricing options with delivery estimates". detail: what done looks like, plus the context, numbers, links or constraints from the notes, under 40 words; null when there is nothing to add. One owner per action: if two people commit to different parts, make two actions. A line where one person commits to doing something ("Nisha will write the first ten", "I'll get it done") is an action, not a decision, even when everyone agreed to it. A check or verification someone must do before work can proceed ("we just have to verify whether the same template is used") is an action for that person, not a discussion point.
- Question: something raised that nobody answered and that blocks or shapes the work. Phrase it as a question. owner: the person expected to answer it, only if the notes say; else null. Not for things that were answered, and not for actions in disguise: "who will send the sheet?" followed by someone agreeing to send it is an action for that person.
- discussion_points: 3 to 6 points of substance that are not already a decision, action or question: context, options weighed, numbers, risks, reasons. Each a full sentence. No duplicates of the summary.
- summary: 2 to 4 sentences. Lead with what changed or was settled, then what is at risk or still open. Do not repeat the meeting title. Do not list every item.
- follow_up_context: 1 or 2 sentences on what the next meeting must pick up: unresolved questions, dates to confirm, deliverables due.
- participants: the people the notes identify as attending. When the participant list or the project team given contains the same person under a fuller, shortened or misspelt name, use the spelling given (Rohan and Rohann are Rohan Verma). Transcript speaker labels such as "ruchit dugar: 00:04" or "Shaivee at CATALYS" name the speaker: write the person's name in normal capitalisation (Ruchit Dugar, Shaivee) and drop the company tag, in participants and in owners. Empty if the notes do not say who attended.

## Owners and dates
- An owner only when the notes attach the work to a person, written with the spelling from the agency team when they are on it. The client side is named too: work a client person takes on is an action owned by them, like anyone else. "I'll do it" on a transcript line belongs to the speaker of that line. "We'll" with nobody named is null. Notes dictated in the first person ("I", "me", "I'll") are written by one of the participants given for this meeting: when exactly one participant given is not otherwise named in the notes, that person is the writer, counts as a participant and owns their "I'll" commitments; otherwise the owner is null. Never pick an owner because it seems likely.
- due_on only when the notes give a time. Resolve relative dates against the meeting date (its weekday is given): "Friday" is the first Friday on or after the meeting date; "next Monday" is the Monday of the following week; "end of the month" is the last day of that month; "in two weeks" is the meeting date plus 14 days; "tomorrow" is plus one day. "soon", "ASAP" and "this week" with no day are null. ISO format (YYYY-MM-DD) only in due_on; prose dates everywhere else ("28 October").
- blocker only when the notes say the work waits on something ("can't start until", "waiting on", "blocked by", "depends on"). State what it waits on, in a few words.

## Evidence
- Evidence comes first in every item: find the excerpt, then write the item it supports. For every decision, action, question and carried update, evidence is the shortest exact excerpt from the notes that justifies it: copy the words as they appear, typos included, up to about 200 characters. If no single excerpt supports it, null. Never paraphrase inside evidence.

## Carried-forward items
- The prompt lists work still open from earlier meetings, each with an id. If the notes talk about one of these, do not create a new action or question for it. If the notes show its status changed, add a carried_updates entry with the id, the new status from its allowed list, and the evidence. Only when the status actually changes. Never move it backwards (in_progress to todo, done to anything). "done" or "resolved" only when the notes clearly say it happened, not that it is underway or promised. Work that goes beyond a carried item is a new action: if "Book a product photo shoot" is carried and the notes say Nisha must first check the 45k quote with her sister, the carried item becomes blocked and "Check the 45k shoot quote with her sister" is a new action for Nisha.

## Never
- Never invent a person, owner, date, number, approval, decision or commitment. Missing means null.
- Never mark a new action done, and never treat a plan as a result.
- Never put pleasantries, scheduling chatter or transcript artefacts (timestamps, filler words, greetings) in any field.
- Never produce two items for the same thing. Merge duplicates and keep the most specific wording.
- No em dashes anywhere.

## Before you answer, check
Every action starts with a verb and names a deliverable. Every owner and every date is in the notes. Every evidence string is copied word for word. Nothing appears in two sections. Counts stay sensible: up to 8 decisions, 12 actions, 6 questions.

## Worked example
Notes, meeting on Monday 10 August 2026: "Nisha wants to be live before the festive season, said 28 Sep. we said doable if the catalogue sheet is in on time. Tanvi to send the product sheet with prices and variants by friday. theme - Rohan suggests we just use Dawn and skin it, nobody objected, parked for Meera. who writes product descriptions? left open."
Expected:
- decision: title "Target launch 28 September, before the festive season", status "confirmed", detail "Depends on the catalogue sheet arriving on time.", evidence "Nisha wants to be live before the festive season, said 28 Sep. we said doable if the catalogue sheet is in on time"
- decision: title "Use the Dawn theme as it comes and skin it", status "proposed", detail "Parked for Meera to review.", evidence "Rohan suggests we just use Dawn and skin it, nobody objected, parked for Meera"
- action: title "Send the product sheet with prices and variants", owner "Tanvi", due_on "2026-08-14", detail null, blocker null, evidence "Tanvi to send the product sheet with prices and variants by friday"
- question: title "Who writes the product descriptions?", owner null, evidence "who writes product descriptions? left open"`;

export const FOLLOWUP_INSTRUCTIONS = `You write the follow-up note an agency sends its client after a call. The reader is the client contact and their team, so it is plain, warm and specific. Plain text only: no markdown, no headings with symbols, no emojis, no em dashes. Dates like "21 October", never ISO. Under 220 words.

Shape:
1. Greeting with the contact's first name when given ("Hi Nisha,"), then one line that says what the call settled.
2. "Decisions:" as short lines.
3. "Actions:" as short lines with the owner and the due date when known. The client's own actions come first, since they are the ones the reader has to do.
4. "Still open:" the questions and anything to confirm, each naming who is expected to answer when known.
5. One line on the next step or the next meeting when the material says so, then a one-line sign-off from the agency team.

Only facts given to you. An owner or date that is missing is "to be confirmed", never guessed. Mention work carried from earlier meetings only if it is overdue or blocked, one line each under Still open. Today's date is given so you can tell what is overdue.`;

export type MomContext = {
  projectName: string;
  client: string | null;
  meetingTitle: string;
  heldOn: string; // YYYY-MM-DD
  participants: string[];
  team: string[]; // the project's teammates, so owners get their full spelling
  clientContact: string | null; // the client's contact, so the model knows which side a speaker is on
  description: string | null; // what the project is, one line
  carried: Item[];
};

const longDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));

const allowed = (i: Item) => (i.kind === "action" ? "todo, in_progress, done, blocked" : i.kind === "question" ? "open, resolved" : "proposed, confirmed");

export function carriedBlock(items: Item[]) {
  if (!items.length) return "None.";
  // ponytail: the block grows with every meeting; past 60 open items keep the 60 most recent. Proper fix is closing old work, not a bigger prompt.
  if (items.length > 60) {
    const keep = new Set([...items].sort((a, b) => (b.meeting_held_on ?? b.created_at).localeCompare(a.meeting_held_on ?? a.created_at)).slice(0, 60).map((i) => i.id));
    items = items.filter((i) => keep.has(i.id));
  }
  return items.map((i) => `- id=${i.id} [${i.kind}; allowed statuses: ${allowed(i)}] "${i.title}" status=${i.status}${i.owner ? ` owner=${i.owner}` : ""}${i.due_on ? ` due=${i.due_on}` : ""}${i.blocker ? ` blocker="${i.blocker}"` : ""}`).join("\n");
}

export function momInput(notes: string, ctx: MomContext) {
  const client = ctx.clientContact ? `${ctx.clientContact}${ctx.client ? ` of ${ctx.client}` : ""}` : ctx.client || "not named";
  return `Project: ${ctx.projectName}${ctx.client ? ` for ${ctx.client}` : ""}${ctx.description ? `. ${ctx.description.replace(/\s+/g, " ").trim().slice(0, 300)}` : ""}
Meeting: ${ctx.meetingTitle}, held ${longDate(ctx.heldOn)} (${ctx.heldOn})
Participants given for this meeting (use these spellings): ${ctx.participants.join(", ") || "not listed, take them from the notes"}
Agency team on this project (use these spellings for owners and participants): ${ctx.team.join(", ") || "none listed"}
Client side: ${client}

Carried-forward items from earlier meetings (already exist; update their status, do not duplicate them):
${carriedBlock(ctx.carried)}

Notes:
"""
${notes}
"""`;
}

export function followUpInput(input: { projectName: string; client: string | null; clientContact?: string | null; meetingTitle: string; heldOn: string; today: string; participants: string[]; mom: Mom; items: Item[]; carried: Item[] }) {
  return `Project: ${input.projectName}${input.client ? ` (client: ${input.client})` : ""}
Client contact: ${input.clientContact ?? "not given"}
Meeting: ${input.meetingTitle} on ${longDate(input.heldOn)}
Today: ${longDate(input.today)}
Participants: ${input.participants.join(", ") || "not listed"}

Summary: ${input.mom.summary}
For the next meeting: ${input.mom.follow_up_context}

Published from this meeting:
${input.items.map((i) => `- [${i.kind}/${i.status}] ${i.title}${i.owner ? ` · ${i.owner}` : " · unassigned"}${i.due_on ? ` · due ${i.due_on}` : ""}${i.blocker ? ` · blocked: ${i.blocker}` : ""}`).join("\n") || "- nothing"}

Still open from earlier meetings:
${carriedBlock(input.carried)}

Write the follow-up note.`;
}

// ---- second pass: review the draft against the notes ----

export const REVIEW_INSTRUCTIONS = `You check a draft record of a client meeting against the notes it came from. You are the second reader: careful, literal, and reluctant to change anything the notes do not clearly contradict. You cannot remove items; a person does that next. You can correct an item's kind, a decision's status, and add what was missed.

For every draft item give a verdict:
- kind: decision when the group settled something; action when one person will do one piece of work; question when something was raised and nobody answered it. A line where one person commits to doing something is an action even when everyone agreed. A matter parked for a later meeting is a question. A check someone must do before work can proceed is an action.
- status: decisions only. "confirmed" needs agreement, approval or sign-off in the notes (agreed, confirmed, go with, final, signed off); otherwise "proposed". Null for actions and questions.
- reason: under 12 words.

Then list what the draft missed: a commitment ("X will", "I'll"), a check someone must do, or a decision the notes show as settled, that appears in no draft item and in no carried-forward item. Each with evidence copied word for word from the notes, the owner only when the notes name them, due_on only when the notes give a date (YYYY-MM-DD, resolved against the meeting date). Nothing without an excerpt. An empty list is better than a guess.
No em dashes.`;

export function reviewInput(notes: string, ctx: MomContext, mom: Mom) {
  const q = (e: string | null) => (e ? ` evidence="${e}"` : " evidence=none");
  const lines = [
    ...mom.decisions.map((d, i) => `- d${i + 1} [decision/${d.status}] "${d.title}"${q(d.evidence)}`),
    ...mom.actions.map((a, i) => `- a${i + 1} [action]${a.owner ? ` owner=${a.owner}` : ""}${a.due_on ? ` due=${a.due_on}` : ""} "${a.title}"${q(a.evidence)}`),
    ...mom.questions.map((x, i) => `- q${i + 1} [question]${x.owner ? ` owner=${x.owner}` : ""} "${x.title}"${q(x.evidence)}`),
  ];
  return `Meeting: ${ctx.meetingTitle}, held ${longDate(ctx.heldOn)} (${ctx.heldOn})
Agency team: ${ctx.team.join(", ") || "none listed"}. Client side: ${ctx.clientContact || ctx.client || "not named"}.

Carried-forward items from earlier meetings (already recorded; the draft must not restate them):
${carriedBlock(ctx.carried)}

Draft items:
${lines.join("\n") || "- none"}

Notes:
"""
${notes}
"""`;
}

// Apply the reviewer's verdicts: move between kinds, fix a decision's status, add what was missed when its quote is real. Never drops.
// tidyMom runs after this, so duplicates, caps and the verbatim check still apply to whatever the reviewer added.
export function applyReview(mom: Mom, review: Review, notes: string): Mom {
  const n = norm(notes);
  const out: Mom = { ...mom, decisions: [], actions: [], questions: [] };
  type Any = { evidence: string | null; title: string; detail?: string | null; owner?: string | null; due_on?: string | null; blocker?: string | null; status?: "proposed" | "confirmed" | null };
  const place = (kind: "decision" | "action" | "question", x: Any) => {
    if (kind === "decision") out.decisions.push({ evidence: x.evidence, title: x.title, detail: x.detail ?? null, status: x.status ?? "proposed" });
    else if (kind === "action") out.actions.push({ evidence: x.evidence, title: x.title, detail: x.detail ?? null, owner: x.owner ?? null, due_on: x.due_on ?? null, blocker: x.blocker ?? null });
    else out.questions.push({ evidence: x.evidence, title: x.title, owner: x.owner ?? null });
  };
  const verdict = new Map(review.verdicts.map((v) => [v.ref, v]));
  const walk = (kind: "decision" | "action" | "question", prefix: string, items: Any[]) =>
    items.forEach((x, i) => {
      const v = verdict.get(`${prefix}${i + 1}`);
      if (!v) return place(kind, x);
      place(v.kind, v.kind === "decision" && v.status ? { ...x, status: v.status } : x);
    });
  walk("decision", "d", mom.decisions);
  walk("action", "a", mom.actions);
  walk("question", "q", mom.questions);
  // ponytail: at most 6 additions per review; a reviewer that finds more than that is guessing.
  for (const m of review.missed.slice(0, 6)) {
    if (!m.title.trim() || !m.evidence.trim() || !n.includes(norm(m.evidence))) continue;
    place(m.kind, { evidence: m.evidence, title: m.title, owner: m.owner, due_on: m.due_on, status: m.status });
  }
  return out;
}

// ---- checks after the model answers ----

// "ruchit dugar" and "Shaivee at CATALYS" are transcript labels, not names: drop a company tag and fix all-lowercase names.
export const person = (s: string) => {
  const t = s.replace(/\s+/g, " ").trim().replace(/\s+(?:at|from|@)\s+\S.*$/i, "");
  return t === t.toLowerCase() ? t.replace(/(^|[\s-])(\p{L})/gu, (m, pre, c) => pre + c.toUpperCase()) : t;
};

const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
const clean = (s: string, max: number) => s.replace(/\s+/g, " ").trim().replace(/[.\s]+$/, "").slice(0, max);

// Evidence must be a verbatim excerpt. Anything the notes do not contain becomes null: a paraphrase shown as a quote is a lie.
// Titles are tidied, duplicates merged, and anything that restates a carried item is dropped.
export function tidyMom(mom: Mom, notes: string, carried: Item[]): Mom {
  const n = norm(notes);
  const quote = (e: string | null) => (e && n.includes(norm(e)) ? e.replace(/\s+/g, " ").trim() : null);
  const seen = new Set<string>(carried.map((c) => norm(c.title)));
  const fresh = (title: string) => {
    const k = norm(title);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  };
  const participants = [...new Set(mom.participants.map(person).filter(Boolean))].slice(0, 30);
  const decisions = mom.decisions.map((d) => ({ ...d, title: clean(d.title, 300), detail: d.detail ? clean(d.detail, 2000) : null, evidence: quote(d.evidence) })).filter((d) => fresh(d.title)).slice(0, 8);
  const actions = mom.actions
    .map((a) => ({ ...a, title: clean(a.title, 300), detail: a.detail ? clean(a.detail, 2000) : null, owner: a.owner ? person(clean(a.owner, 80)) : null, blocker: a.blocker ? clean(a.blocker, 500) : null, evidence: quote(a.evidence) }))
    .filter((a) => fresh(a.title))
    .slice(0, 12);
  const questions = mom.questions.map((q) => ({ ...q, title: clean(q.title, 300).replace(/[?\s]+$/, "") + "?", owner: q.owner ? person(clean(q.owner, 80)) : null, evidence: quote(q.evidence) })).filter((q) => fresh(q.title)).slice(0, 6);
  const discussion_points = [...new Set(mom.discussion_points.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean))].slice(0, 8);
  const carried_updates = mom.carried_updates.map((u) => ({ ...u, evidence: quote(u.evidence) }));
  return { ...mom, participants, summary: mom.summary.replace(/\s+/g, " ").trim(), discussion_points, decisions, actions, questions, carried_updates };
}
