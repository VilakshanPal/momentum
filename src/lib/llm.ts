import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { MomSchema, type Item, type Mom } from "./schema";

const MODEL = "claude-opus-5-5";

type Ctx = {
  projectName: string;
  client: string | null;
  meetingTitle: string;
  heldOn: string;
  participants: string[];
  carried: Item[];
};

const SYSTEM = `You turn rough meeting notes from an agency team into structured Minutes of Meeting.

Rules you must never break:
- Never invent a person, owner, deadline, approval, decision or commitment. If the notes do not state an owner or date, use null.
- A decision is "confirmed" only if the notes show agreement or sign-off. Otherwise it is "proposed". Suggestions and discussion are not decisions.
- Never mark anything complete or resolved. Status changes are made by humans after review.
- Open questions are things nobody answered in the meeting. Keep them separate from actions.
- For every decision, action and question, include "evidence": the shortest verbatim excerpt from the notes that justifies it, or null if none.
- due_on must be an ISO date (YYYY-MM-DD) resolved relative to the meeting date, or null if the notes only say something vague like "soon".
- The notes may reference work that already exists as a carried-forward item (listed in the prompt). Do not create a new action or question for it. Instead add an entry to carried_updates with the item id, the status the notes suggest, and the evidence. Suggest "done"/"resolved" only when the notes clearly say it happened.
- Write titles as short imperative or declarative phrases. Keep the summary to three or four sentences. follow_up_context is one or two sentences about what the next meeting needs to pick up.
- Use only information in the notes. Do not pad with assumptions.`;

function carriedBlock(items: Item[]) {
  if (!items.length) return "No carried-forward items.";
  return items
    .map(
      (i) =>
        `- id=${i.id} [${i.kind}] "${i.title}" status=${i.status}${i.owner ? ` owner=${i.owner}` : ""}${i.due_on ? ` due=${i.due_on}` : ""}${i.blocker ? ` blocker="${i.blocker}"` : ""}`,
    )
    .join("\n");
}

export async function generateMom(notes: string, ctx: Ctx): Promise<Mom> {
  if (process.env.LLM_MOCK === "1" && process.env.NODE_ENV !== "production") return mockMom(notes, ctx);

  const client = new Anthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Project: ${ctx.projectName}${ctx.client ? ` (client: ${ctx.client})` : ""}
Meeting: ${ctx.meetingTitle} on ${ctx.heldOn}
Participants: ${ctx.participants.join(", ") || "not listed"}

Carried-forward items (already exist, do not duplicate):
${carriedBlock(ctx.carried)}

Rough notes:
"""
${notes}
"""`,
      },
    ],
    output_config: { format: zodOutputFormat(MomSchema) },
  });

  if (res.stop_reason === "refusal") throw new Error("The model declined to process these notes.");
  if (!res.parsed_output) throw new Error("The model returned an invalid draft. Try again.");
  // Only keep carried_updates that reference real carried items.
  const ids = new Set(ctx.carried.map((c) => c.id));
  res.parsed_output.carried_updates = res.parsed_output.carried_updates.filter((u) => ids.has(u.item_id));
  return res.parsed_output;
}

export async function generateFollowUp(input: {
  projectName: string;
  client: string | null;
  meetingTitle: string;
  heldOn: string;
  participants: string[];
  mom: Mom;
  items: Item[];
  carried: Item[];
}): Promise<string> {
  if (process.env.LLM_MOCK === "1" && process.env.NODE_ENV !== "production") return mockFollowUp(input);

  const client = new Anthropic();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: `You write short follow-up messages after agency client meetings. Plain text, no markdown headings, no emojis. Friendly and direct. Only include facts given to you. If an owner or date is missing, say it is unassigned or to be confirmed rather than guessing. Structure: one-line opener, "Decisions", "Actions" (owner, due date if known), "Still open" (questions and anything needing confirmation), one-line close. Keep it under 250 words.`,
    messages: [
      {
        role: "user",
        content: `Project: ${input.projectName}${input.client ? ` (client: ${input.client})` : ""}
Meeting: ${input.meetingTitle} on ${input.heldOn}
Participants: ${input.participants.join(", ")}

Summary: ${input.mom.summary}

Published items from this meeting:
${input.items.map((i) => `- [${i.kind}/${i.status}] ${i.title}${i.owner ? ` — ${i.owner}` : " — unassigned"}${i.due_on ? ` — due ${i.due_on}` : ""}${i.blocker ? ` — blocked: ${i.blocker}` : ""}`).join("\n")}

Still unresolved from earlier meetings:
${carriedBlock(input.carried)}

Write the follow-up message.`,
      },
    ],
  });
  if (res.stop_reason === "refusal") throw new Error("The model declined to write this follow-up.");
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  if (!text) throw new Error("Empty follow-up returned. Try again.");
  return text;
}

// ---- Dev-only mock: deterministic output from the notes so the UI can be exercised offline. ----

function mockMom(notes: string, ctx: Ctx): Mom {
  const lines = notes.split("\n").map((l) => l.trim()).filter((l) => l.length > 12);
  const pick = (re: RegExp) => lines.filter((l) => re.test(l));
  const actions = pick(/\b(will|to)\b .*\b(by|send|scope|revise|set up|confirm)\b/i).slice(0, 4);
  const decisions = pick(/\b(agreed|confirmed|is|stays?|only)\b/i).slice(0, 3);
  const questions = pick(/\?|tbc|not sure|maybe|depends/i).slice(0, 3);
  const name = (l: string) => l.match(/\b(Priya|Meera|Rohan|Arjun|Kavya|Arman)\b/)?.[1] ?? null;
  return {
    summary: `[MOCK DRAFT] ${ctx.meetingTitle} on ${ctx.heldOn}. ${lines.slice(1, 3).join(" ")}`,
    discussion_points: lines.slice(1, 5),
    decisions: decisions.map((l) => ({ title: l.slice(0, 80), detail: null, status: /agreed|confirmed/i.test(l) ? "confirmed" : "proposed", evidence: l })),
    actions: actions.map((l) => ({ title: l.slice(0, 80), detail: null, owner: name(l), due_on: null, blocker: /blocked/i.test(l) ? "See notes" : null, evidence: l })),
    questions: questions.map((l) => ({ title: l.slice(0, 80), owner: name(l), evidence: l })),
    carried_updates: ctx.carried.slice(0, 1).map((c) => ({ item_id: c.id, suggested_status: c.kind === "action" ? "done" : "resolved", evidence: lines[2] ?? null })),
    follow_up_context: "Mock output. Set ANTHROPIC_API_KEY and unset LLM_MOCK for real generation.",
  };
}

function mockFollowUp(input: { meetingTitle: string; heldOn: string; items: Item[] }) {
  return `[MOCK] Hi all, quick recap of ${input.meetingTitle} (${input.heldOn}).\n\nActions:\n${input.items
    .filter((i) => i.kind === "action")
    .map((i) => `- ${i.title} — ${i.owner ?? "unassigned"}${i.due_on ? `, due ${i.due_on}` : ""}`)
    .join("\n")}\n\nThanks,\nArman`;
}
