import "server-only";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { MomSchema, ReviewSchema, type Item, type Mom } from "./schema";
import { FOLLOWUP_INSTRUCTIONS, MOM_INSTRUCTIONS, REVIEW_INSTRUCTIONS, applyReview, followUpInput, momInput, reviewInput, tidyMom, type MomContext } from "./prompt";
import { mockFollowUp, mockMom } from "./mock";

// Override with OPENAI_MODEL. Any model with structured outputs works.
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";
const client = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Reasoning models: medium on the draft (the extraction is where accuracy is won), low on the review and the follow-up,
// so the two calls together stay inside Vercel's 60s function limit. OPENAI_REASONING overrides the draft's effort.
const isReasoning = /^(gpt-5|o\d)/.test(MODEL);
const reasoning = isReasoning ? { effort: (process.env.OPENAI_REASONING ?? "medium") as "low" | "medium" | "high" } : undefined;
const lowReasoning = isReasoning ? { effort: "low" as const } : undefined;
// Second pass on every draft unless switched off (LLM_REVIEW=0): a reviewer model checks each item against the notes.
const REVIEW = process.env.LLM_REVIEW !== "0";

// Mock instead of OpenAI: LLM_MOCK=1 locally, or a browser that opened any page with ?dev=yes (src/proxy.ts).
export async function mocked() {
  return (process.env.LLM_MOCK === "1" && process.env.NODE_ENV !== "production") || (await cookies()).get("dev")?.value === "1";
}

// One line per call in the server log, so Vercel's function logs show where the tokens go. Cached input is billed at a tenth.
type Usage = { input_tokens: number; output_tokens: number; input_tokens_details?: { cached_tokens: number }; output_tokens_details?: { reasoning_tokens: number } };
const logUsage = (what: string, u: Usage | undefined, ms: number) =>
  u && console.log(`llm ${what}: ${(ms / 1000).toFixed(1)}s, input ${u.input_tokens} (cached ${u.input_tokens_details?.cached_tokens ?? 0}), output ${u.output_tokens} (reasoning ${u.output_tokens_details?.reasoning_tokens ?? 0})`);

// Whitespace is tokens: runs of spaces and blank lines go before the notes are sent. Evidence still matches, tidyMom compares with whitespace collapsed.
const squeeze = (s: string) => s.replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

function refused(res: { output: { type: string; content?: { type: string }[] }[] }) {
  return res.output.some((o) => o.type === "message" && o.content?.some((c) => c.type === "refusal"));
}

export async function generateMom(notes: string, ctx: MomContext): Promise<Mom> {
  if (await mocked()) return mockMom(notes, ctx.carried);

  const text = squeeze(notes);
  let t0 = Date.now();
  const res = await client().responses.parse({
    model: MODEL,
    instructions: MOM_INSTRUCTIONS,
    input: momInput(text, ctx),
    text: { format: zodTextFormat(MomSchema, "mom") },
    reasoning,
    max_output_tokens: 12_000, // a draft is 2 to 4k with reasoning; this only stops a runaway
    prompt_cache_key: "mom", // same instructions every call: route to the same cache
  });
  logUsage("mom", res.usage, Date.now() - t0);

  const raw = res.output_parsed;
  if (!raw) throw new Error(refused(res) ? "The model declined to process these notes." : "The model returned an invalid draft. Try again.");
  // Only keep carried_updates that reference real carried items, then apply the after-the-model checks (verbatim evidence, duplicates, tidy titles).
  const ids = new Set(ctx.carried.map((c) => c.id));
  raw.carried_updates = raw.carried_updates.filter((u) => ids.has(u.item_id));
  const mom = tidyMom(raw, notes, ctx.carried);
  // ponytail: the function has 120s (maxDuration on the meeting page); a draft that already took 50s skips the review rather than risk a timeout.
  if (!REVIEW || Date.now() - t0 > 50_000) {
    if (REVIEW) console.log("llm review: skipped, draft took too long");
    return mom;
  }

  // Second pass. If the reviewer fails for any reason the first draft stands: a review is a bonus, never a blocker.
  try {
    t0 = Date.now();
    const r = await client().responses.parse({
      model: MODEL,
      instructions: REVIEW_INSTRUCTIONS,
      input: reviewInput(text, ctx, mom),
      text: { format: zodTextFormat(ReviewSchema, "review") },
      reasoning: lowReasoning,
      max_output_tokens: 6_000,
      prompt_cache_key: "review",
    });
    logUsage("review", r.usage, Date.now() - t0);
    const review = r.output_parsed;
    if (!review) return mom;
    const changed = review.verdicts.filter((v) => v.kind !== { d: "decision", a: "action", q: "question" }[v.ref[0]] || (v.ref[0] === "d" && v.status && v.status !== mom.decisions[Number(v.ref.slice(1)) - 1]?.status));
    console.log(`llm review: ${review.verdicts.length} verdicts, ${changed.length} changed, ${review.missed.length} missed`, changed.map((v) => `${v.ref} to ${v.kind}${v.status ? "/" + v.status : ""}: ${v.reason}`), review.missed.map((m) => `+${m.kind} "${m.title}"`));
    return tidyMom(applyReview(mom, review, notes), notes, ctx.carried);
  } catch (e) {
    console.error("review failed, keeping the first draft", e);
    return mom;
  }
}

export async function generateFollowUp(input: {
  projectName: string;
  client: string | null;
  clientContact?: string | null;
  today: string;
  meetingTitle: string;
  heldOn: string;
  participants: string[];
  mom: Mom;
  items: Item[];
  carried: Item[];
}): Promise<string> {
  if (await mocked()) return mockFollowUp(input);

  const t0 = Date.now();
  const res = await client().responses.create({
    model: MODEL,
    instructions: FOLLOWUP_INSTRUCTIONS,
    input: followUpInput(input),
    reasoning: lowReasoning,
    max_output_tokens: 3_000,
    prompt_cache_key: "followup",
  });
  logUsage("follow-up", res.usage, Date.now() - t0);
  const text = res.output_text.trim();
  if (!text) throw new Error(refused(res) ? "The model declined to write this follow-up." : "Empty follow-up returned. Try again.");
  return text;
}
