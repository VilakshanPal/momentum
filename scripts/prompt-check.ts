// The one check behind src/lib/prompt.ts: the after-the-model tidy keeps verbatim evidence, drops paraphrased evidence,
// merges duplicates, drops restated carried items, and the input carries the weekday. Run: npx tsx scripts/prompt-check.ts
import assert from "node:assert/strict";
import { applyReview, momInput, person, reviewInput, tidyMom } from "../src/lib/prompt";
import { resolveName } from "../src/lib/names";
import { MomSchema } from "../src/lib/schema";
import type { Item, Mom } from "../src/lib/schema";

const notes = `Aarohi kickoff - 10 Aug
Tanvi to send the product sheet with prices and variants by friday.
Nisha's cousin keeps asking about international shipping. Rohan says Shiprocket does it but duties are messy.
agreed - Shopify, Basic plan to start`;

const carried: Item[] = [{ id: "c1", project_id: "p", meeting_id: "m", kind: "action", title: "Send logo files and the colour palette", detail: null, owner: "Nisha", due_on: null, status: "todo", blocker: null, evidence: null, supersedes_id: null, position: 0, created_at: "", updated_at: "" } as unknown as Item];

const raw: Mom = {
  participants: ["Nisha", " Rohan ", "Nisha", "ruchit dugar", "Shaivee at CATALYS"],
  summary: "  Shopify it is.   Shipping stays open.  ",
  discussion_points: ["International shipping is possible through Shiprocket but duties are messy.", "", "International shipping is possible through Shiprocket but duties are messy."],
  decisions: [
    { title: "Build the store on Shopify, Basic plan.", detail: null, status: "confirmed", evidence: "agreed - Shopify, Basic plan to start" },
    { title: "Build the store on Shopify, Basic plan", detail: "dup", status: "confirmed", evidence: "The team agreed on Shopify" }, // paraphrased evidence, duplicate title
  ],
  actions: [
    { title: "Send the product sheet with prices and variants", detail: null, owner: "Tanvi", due_on: "2026-08-14", blocker: null, evidence: "Tanvi to send the product sheet with prices and variants by friday" },
    { title: "Send logo files and the colour palette", detail: null, owner: "Nisha", due_on: null, blocker: null, evidence: null }, // restates a carried item
  ],
  questions: [{ title: "Do we ship internationally??", owner: "vilakshan at CATALYS", evidence: "cousin keeps asking about international shipping" }],
  carried_updates: [{ item_id: "c1", suggested_status: "in_progress", evidence: "not in the notes at all" }],
  follow_up_context: "Confirm shipping.",
};

const out = tidyMom(raw, notes, carried);
assert.deepEqual(out.participants, ["Nisha", "Rohan", "Ruchit Dugar", "Shaivee"], "participants trimmed, deduplicated, speaker labels normalised");
assert.equal(out.summary, "Shopify it is. Shipping stays open.");
assert.equal(out.discussion_points.length, 1, "empty and duplicate discussion points dropped");
assert.equal(out.decisions.length, 1, "duplicate decision merged");
assert.equal(out.decisions[0].title, "Build the store on Shopify, Basic plan", "trailing full stop removed");
assert.equal(out.decisions[0].evidence, "agreed - Shopify, Basic plan to start", "verbatim evidence kept");
assert.equal(out.actions.length, 1, "action restating a carried item dropped");
assert.equal(out.actions[0].evidence, "Tanvi to send the product sheet with prices and variants by friday");
assert.equal(out.questions[0].title, "Do we ship internationally?", "exactly one question mark");
assert.equal(out.questions[0].owner, "Vilakshan", "owner label normalised");
assert.equal(person("Priya Nair"), "Priya Nair", "a proper name is left alone");
assert.equal(out.questions[0].evidence, "cousin keeps asking about international shipping", "evidence found despite the apostrophe elsewhere");
assert.equal(out.carried_updates[0].evidence, null, "paraphrased evidence on a carried update becomes null");

const input = momInput(notes, { projectName: "Aarohi", client: "Aarohi Ceramics", meetingTitle: "Kickoff", heldOn: "2026-08-10", participants: ["Rohan Verma"], team: ["Rohan Verma", "Priya Nair"], clientContact: "Nisha Agarwal", description: "  Shopify store for a ceramics brand,\n launching before the festive season. ", carried });
assert.ok(input.includes("Agency team on this project (use these spellings for owners and participants): Rohan Verma, Priya Nair"), "team given to the model");
assert.ok(input.includes("Client side: Nisha Agarwal of Aarohi Ceramics"), "client side named");
assert.ok(input.includes("Project: Aarohi for Aarohi Ceramics. Shopify store for a ceramics brand, launching before the festive season."), "description on one line");
assert.ok(momInput("x", { projectName: "P", client: null, meetingTitle: "M", heldOn: "2026-08-10", participants: [], team: [], clientContact: null, description: null, carried: [] }).includes("Client side: not named"), "no client is said plainly");
for (const key of ["decisions", "actions", "questions"] as const) assert.equal(Object.keys(MomSchema.shape[key].element.shape)[0], "evidence", key + ": evidence is the first field");
const many = Array.from({ length: 70 }, (_, i) => ({ ...carried[0], id: "c" + i, title: "Item " + i, meeting_held_on: "2026-08-" + String(1 + (i % 28)).padStart(2, "0") }));
assert.equal(momInput("x", { projectName: "P", client: null, meetingTitle: "M", heldOn: "2026-09-01", participants: [], team: [], clientContact: null, description: null, carried: many }).split("\n- id=").length - 1, 60, "carried block capped at 60");

const team = ["Rohan Verma", "Priya Nair", "Kavya Iyer", "Sameer Bhatt"];
assert.equal(resolveName("Rohan", team), "Rohan Verma", "first name resolves");
assert.equal(resolveName("Rohann", team), "Rohan Verma", "one extra letter resolves");
assert.equal(resolveName("Preya", team), "Priya Nair", "one wrong letter resolves");
assert.equal(resolveName("Samer", team), "Sameer Bhatt", "one missing letter resolves");
assert.equal(resolveName("Nish", team), "Nish", "short names are left as typed");
assert.equal(resolveName("Kavya Iyer", team), "Kavya Iyer", "exact full name stays");
assert.equal(resolveName("Tanvi", team), "Tanvi", "an unknown name stays");
assert.equal(resolveName("Rohan", [...team, "Rohan Mehta"]), "Rohan", "two Rohans: left alone");
assert.ok(input.includes("held Monday, 10 August 2026 (2026-08-10)"), "weekday given so relative dates resolve");
assert.ok(input.includes('id=c1 [action; allowed statuses: todo, in_progress, done, blocked] "Send logo files and the colour palette" status=todo owner=Nisha'), "carried block lists id, kind, allowed statuses and state");

// Review pass: drop, move between kinds, status fix, additions only with a verbatim quote.
const draft = {
  participants: [], summary: "", discussion_points: [], follow_up_context: "", carried_updates: [],
  decisions: [
    { evidence: "Nisha will write the first 10 herself", title: "Nisha writes the first ten descriptions", detail: null, status: "confirmed" as const },
    { evidence: "we could go with Dawn", title: "Use the Dawn theme", detail: "Rohan's suggestion.", status: "confirmed" as const },
  ],
  actions: [{ evidence: null, title: "Discuss pricing", detail: null, owner: null, due_on: null, blocker: null }],
  questions: [{ evidence: "parked, decide next week", title: "Do we offer COD at launch?", owner: null }],
};
const ctx = { projectName: "Aarohi", client: "Aarohi Ceramics", meetingTitle: "Design review", heldOn: "2026-08-24", participants: [], team: ["Rohan Verma"], clientContact: "Nisha", description: null, carried };
const rin = reviewInput("notes here", ctx, draft);
assert.ok(rin.includes('- d1 [decision/confirmed] "Nisha writes the first ten descriptions" evidence="Nisha will write the first 10 herself"'), "draft items labelled d1, a1, q1");
assert.ok(rin.includes('- a1 [action] "Discuss pricing" evidence=none'), "missing evidence is said");
const notes2 = "Nisha will write the first 10 herself. we could go with Dawn. parked, decide next week. Kavya to list what documents Nisha needs";
const reviewed = applyReview(draft, {
  verdicts: [
    { ref: "d1", kind: "action", status: null, reason: "one person commits" },
    { ref: "d2", kind: "decision", status: "proposed", reason: "could, not agreed" },
    { ref: "a1", kind: "action", status: null, reason: "unsupported, but the reviewer cannot drop" },
  ],
  missed: [
    { evidence: "Kavya to list what documents Nisha needs", kind: "action", title: "List the documents for the KYC", owner: "Kavya", due_on: null, status: null },
    { evidence: "Kavya listed the documents", kind: "action", title: "Paraphrased, must be dropped", owner: null, due_on: null, status: null },
  ],
}, notes2);
assert.equal(reviewed.decisions.length, 1, "one decision left");
assert.equal(reviewed.decisions[0].status, "proposed", "status downgraded");
assert.deepEqual(reviewed.actions.map((a) => a.title), ["Nisha writes the first ten descriptions", "Discuss pricing", "List the documents for the KYC"], "decision moved to actions, nothing dropped, missed action added, paraphrased one ignored");
assert.equal(reviewed.actions[0].owner, null, "a moved decision has no owner invented");
assert.equal(reviewed.actions[2].owner, "Kavya", "missed action keeps its owner");
assert.equal(reviewed.questions.length, 1, "question untouched without a verdict");

console.log("prompt-check: all assertions passed");
