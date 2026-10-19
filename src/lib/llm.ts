import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { MomSchema, type Item, type Mom } from "./schema";
import { mockFollowUp, mockMom } from "./mock";

// Override with OPENAI_MODEL. Any model with structured outputs works.
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";
const client = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Reasoning models: keep effort low so a draft returns in well under Vercel's 60s function limit.
const reasoning = /^(gpt-5|o\d)/.test(MODEL) ? { effort: (process.env.OPENAI_REASONING ?? "low") as "low" | "medium" | "high" } : undefined;

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
- The notes may reference work that already exists as a carried-forward item (listed in the prompt). Do not create a new action or question for it. If the notes show its status changed, add an entry to carried_updates with the item id, the new status, and the evidence. Only include entries where the status actually changes. Never move an item backwards (for example in_progress to todo, or done to anything). Suggest "done"/"resolved" only when the notes clearly say it happened.
- participants: people the notes identify as attending, as written. Empty if the notes do not say.
- discussion_points: three to six points covering what was talked about that is not already captured as a decision, action or question. No duplicates of the summary.
- Write dates in prose naturally ("28 October"), ISO format only in due_on.
- Write titles as short imperative or declarative phrases. Keep the summary to three or four sentences. follow_up_context is one or two sentences about what the next meeting needs to pick up.
- Use only information in the notes. Do not pad with assumptions. No em dashes.`;

function carriedBlock(items: Item[]) {
  if (!items.length) return "No carried-forward items.";
  return items
    .map(
      (i) =>
        `- id=${i.id} [${i.kind}; allowed statuses: ${i.kind === "action" ? "todo, in_progress, done, blocked" : i.kind === "question" ? "open, resolved" : "proposed, confirmed"}] "${i.title}" status=${i.status}${i.owner ? ` owner=${i.owner}` : ""}${i.due_on ? ` due=${i.due_on}` : ""}${i.blocker ? ` blocker="${i.blocker}"` : ""}`,
    )
    .join("\n");
}

function refused(res: { output: { type: string; content?: { type: string }[] }[] }) {
  return res.output.some((o) => o.type === "message" && o.content?.some((c) => c.type === "refusal"));
}

export async function generateMom(notes: string, ctx: Ctx): Promise<Mom> {
  if (process.env.LLM_MOCK === "1" && process.env.NODE_ENV !== "production") return mockMom(notes, ctx.carried);

  const res = await client().responses.parse({
    model: MODEL,
    instructions: SYSTEM,
    input: `Project: ${ctx.projectName}${ctx.client ? ` (client: ${ctx.client})` : ""}
Meeting: ${ctx.meetingTitle} on ${ctx.heldOn}
Participants: ${ctx.participants.join(", ") || "not listed"}

Carried-forward items (already exist, do not duplicate):
${carriedBlock(ctx.carried)}

Rough notes:
"""
${notes}
"""`,
    text: { format: zodTextFormat(MomSchema, "mom") },
    reasoning,
  });

  const mom = res.output_parsed;
  if (!mom) throw new Error(refused(res) ? "The model declined to process these notes." : "The model returned an invalid draft. Try again.");
  // Only keep carried_updates that reference real carried items.
  const ids = new Set(ctx.carried.map((c) => c.id));
  mom.carried_updates = mom.carried_updates.filter((u) => ids.has(u.item_id));
  return mom;
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

  const res = await client().responses.create({
    model: MODEL,
    instructions: `You write short follow-up messages after agency client meetings. Plain text, no markdown headings, no emojis, no em dashes. Write dates like "21 October", never ISO. Friendly and direct. Only include facts given to you. If an owner or date is missing, say it is unassigned or to be confirmed rather than guessing. Structure: one-line opener, "Decisions", "Actions" (owner, due date if known), "Still open" (questions and anything needing confirmation), one-line close. Keep it under 250 words.`,
    input: `Project: ${input.projectName}${input.client ? ` (client: ${input.client})` : ""}
Meeting: ${input.meetingTitle} on ${input.heldOn}
Participants: ${input.participants.join(", ")}

Summary: ${input.mom.summary}

Published items from this meeting:
${input.items.map((i) => `- [${i.kind}/${i.status}] ${i.title}${i.owner ? ` · ${i.owner}` : " · unassigned"}${i.due_on ? ` · due ${i.due_on}` : ""}${i.blocker ? ` · blocked: ${i.blocker}` : ""}`).join("\n")}

Still unresolved from earlier meetings:
${carriedBlock(input.carried)}

Write the follow-up message.`,
    reasoning,
  });
  const text = res.output_text.trim();
  if (!text) throw new Error(refused(res) ? "The model declined to write this follow-up." : "Empty follow-up returned. Try again.");
  return text;
}
