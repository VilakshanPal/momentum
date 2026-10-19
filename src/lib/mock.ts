import type { Item, Mom } from "./schema";

// Development-only stand-in for the model. Golden drafts for known test inputs,
// a crude heuristic for anything else. Never used in production.

type Golden = Omit<Mom, "carried_updates"> & {
  carried_updates_by_title: { title_includes: string; suggested_status: string; evidence: string | null }[];
};

const GOLDEN: { key: string; mom: Golden }[] = [
  {
    key: "HAIRO weekly - 20 Oct",
    mom: {
      participants: ["Priya", "Meera", "Rohan", "Kavya", "Arman"],
      summary:
        "Homepage hi-fi approved with two tweaks: an orange CTA and shorter hero copy. Brand guidelines have finally arrived. The product shoot is confirmed for 28 October with photos due 3 November, so the product listing page stays blocked until then. Blog migration is scoped to the last 12 months and checkout will use Razorpay. The 29 November launch still holds if photos land on time.",
      discussion_points: [
        "Homepage hi-fi reviewed; Priya approved the direction with two changes.",
        "Store locator raised by Priya. Feasibility depends on whether HAIRO holds the store list as data.",
        "HubSpot contact form needs a new 'stylist or consumer' field.",
        "29 November launch still looks achievable if photography lands by 3 November.",
      ],
      decisions: [
        {
          title: "Migrate only the last 12 months of blog posts; redirect older posts to the blog index",
          detail: "About 40 posts move. Roughly 100 older posts get a redirect.",
          status: "confirmed",
          evidence: "Blog - Priya checked, migrate only the last 12 months (about 40 posts). older ones get redirected to the blog index",
        },
        { title: "Checkout integrates with Razorpay", detail: "Webflow has a native integration.", status: "confirmed", evidence: "Checkout is Razorpay. Rohan said fine, there's a Webflow integration" },
        { title: "Homepage CTA becomes orange and hero copy is shortened", detail: null, status: "confirmed", evidence: "two tweaks - make the CTA orange not black, and shorten the hero copy" },
      ],
      actions: [
        { title: "Revise homepage hi-fi: orange CTA, shorter hero copy", detail: null, owner: "Meera", due_on: "2026-10-22", blocker: null, evidence: "Meera will revise by wed" },
        { title: "Scope redirects for blog posts older than 12 months", detail: null, owner: "Rohan", due_on: null, blocker: null, evidence: "Rohan to scope the redirects" },
        { title: "Send field spec for the 'stylist or consumer' contact form field", detail: null, owner: "Kavya", due_on: null, blocker: null, evidence: "she'll send the field spec" },
        { title: "Ask ops whether the store list exists as data", detail: "Needed before a store locator can be scoped.", owner: "Priya", due_on: null, blocker: null, evidence: "Priya will ask ops. not committing yet" },
        { title: "Set up a 30 minute copy review with the founder", detail: null, owner: "Priya", due_on: null, blocker: null, evidence: "she'll set up a 30 min review, date tbc" },
      ],
      questions: [
        { title: "Does HAIRO have the store list as structured data?", owner: "Priya", evidence: "depends on whether they have the store list as data" },
        { title: "When is the founder's copy review?", owner: "Priya", evidence: "date tbc" },
      ],
      carried_updates_by_title: [
        { title_includes: "brand guidelines", suggested_status: "done", evidence: "Brand guidelines FINALLY came through this morning, Meera has them" },
        { title_includes: "Hi-fi homepage", suggested_status: "done", evidence: "Meera showed homepage hi-fi. Priya loves it" },
        { title_includes: "Razorpay or Stripe", suggested_status: "resolved", evidence: "Checkout is Razorpay" },
        { title_includes: "signs off on final copy", suggested_status: "resolved", evidence: "Priya says the founder does want to see final copy" },
        { title_includes: "blog migration scope", suggested_status: "done", evidence: "migrate only the last 12 months (about 40 posts)" },
      ],
      follow_up_context: "Next meeting: confirm the 28 October shoot happened, review the revised homepage, and lock the founder's copy review date.",
    },
  },
  {
    key: "Pre-launch check",
    mom: {
      participants: ["Priya Nair", "Rohan Verma", "Kavya Iyer", "Arman"],
      summary:
        "Pre-launch check for the HAIRO site. Photography arrived on 3 November and the product listing page is now unblocked. Rohan expects a staging build by 12 November. The founder's copy review is booked for 10 November. Priya asked for a Hindi language toggle; the team flagged it as a scope change and did not commit. Launch date stays 29 November.",
      discussion_points: [
        "Photos received; Rohan is unblocked on the product listing page.",
        "Priya raised a Hindi language toggle. Rohan estimated roughly a week; not agreed in the meeting.",
        "Kavya confirmed the HubSpot field spec went across last week.",
        "DNS cutover plan: Priya will loop in HAIRO's IT contact.",
      ],
      decisions: [
        { title: "Launch date stays 29 November", detail: null, status: "confirmed", evidence: "Priya: we're still good for the 29th? Rohan: yes if staging is signed off by the 19th" },
        { title: "Hindi language toggle treated as a post-launch scope item", detail: "Needs a separate estimate and sign-off.", status: "proposed", evidence: "Arman: let's not add that to launch scope, we can quote it separately" },
      ],
      actions: [
        { title: "Send the Hindi toggle estimate to Priya", detail: null, owner: "Arman", due_on: null, blocker: null, evidence: "we can quote it separately" },
        { title: "Share HAIRO IT contact for the DNS cutover", detail: null, owner: "Priya", due_on: null, blocker: null, evidence: "Priya: I'll connect you with our IT guy for the DNS thing" },
        { title: "QA pass on staging", detail: null, owner: null, due_on: "2026-11-19", blocker: "Needs the staging build from Rohan", evidence: "someone needs to QA staging before the 19th" },
      ],
      questions: [{ title: "Who runs the QA pass on staging?", owner: null, evidence: "someone needs to QA staging before the 19th, we didn't decide who" }],
      carried_updates_by_title: [
        { title_includes: "Build the product listing page", suggested_status: "in_progress", evidence: "Rohan: photos are in, I'm unblocked" },
        { title_includes: "copy review", suggested_status: "done", evidence: "copy review with the founder is on the 10th" },
        { title_includes: "founder's copy review", suggested_status: "resolved", evidence: "copy review with the founder is on the 10th" },
      ],
      follow_up_context: "Next sync should check the staging link, the QA owner, and whether the Hindi toggle estimate was sent.",
    },
  },
];

// Fireflies-style transcript used to test the paste flow.
export const TEST_TRANSCRIPT = `Transcript: HAIRO x Catalys · Pre-launch check
Date: 2026-11-04 · Duration: 27 min
Participants: Priya Nair, Rohan Verma, Kavya Iyer, Arman

[00:00:12] Arman: Quick one today. Photos, staging, copy review, and anything blocking launch.
[00:00:31] Rohan: Photos are in, I'm unblocked. Product page by the 12th, staging link same day.
[00:01:04] Priya: Great. Copy review with the founder is on the 10th, I booked it this morning.
[00:01:40] Priya: One thing came up internally. Can we have a Hindi toggle on the site? Even just the homepage.
[00:02:15] Rohan: Doable but that's a week at least, translations, layout checks, the works.
[00:02:48] Arman: Let's not add that to launch scope, we can quote it separately. Priya, I'll send you an estimate.
[00:03:10] Priya: Fine, as long as it's not a no.
[00:04:02] Kavya: Field spec for the stylist or consumer thing went across last week, Rohan has it.
[00:04:20] Rohan: Yep, it's in.
[00:05:11] Arman: DNS cutover. Who at HAIRO owns the domain?
[00:05:30] Priya: I'll connect you with our IT guy for the DNS thing.
[00:06:45] Arman: Someone needs to QA staging before the 19th, we didn't decide who last time either.
[00:07:02] Rohan: Not me, I'll be heads down.
[00:07:15] Priya: We're still good for the 29th?
[00:07:22] Rohan: Yes if staging is signed off by the 19th.
[00:07:40] Arman: Ok. Let's leave QA ownership open and sort it on Slack.`;

export function mockMom(notes: string, carried: Item[]): Mom {
  const golden = GOLDEN.find((g) => notes.includes(g.key))?.mom;
  if (golden) {
    const { carried_updates_by_title, ...rest } = golden;
    const carried_updates = carried_updates_by_title.flatMap((u) => {
      const hit = carried.find((c) => c.title.toLowerCase().includes(u.title_includes.toLowerCase()));
      return hit ? [{ item_id: hit.id, suggested_status: u.suggested_status, evidence: u.evidence }] : [];
    });
    return { ...rest, carried_updates };
  }
  return heuristic(notes, carried);
}

function heuristic(notes: string, carried: Item[]): Mom {
  const lines = notes
    .split("\n")
    .map((l) => l.replace(/^\[\d\d:\d\d:\d\d\]\s*/, "").trim())
    .filter((l) => l.length > 12);
  const pick = (re: RegExp) => lines.filter((l) => re.test(l));
  const name = (l: string) => l.match(/\b(Priya|Meera|Rohan|Arjun|Kavya|Arman)\b/)?.[1] ?? null;
  const strip = (l: string) => l.replace(/^[A-Za-z]+:\s*/, "").replace(/[.!]$/, "");
  const who = notes.match(/^(?:Participants|attendees):\s*(.+)$/im)?.[1] ?? "";
  return {
    participants: who.split(/,\s*/).map((x) => x.trim()).filter(Boolean),
    summary: `[Mock draft] ${lines.slice(1, 3).map(strip).join(". ")}.`,
    discussion_points: lines.slice(1, 5).map(strip),
    decisions: pick(/\b(agreed|confirmed|stays?|let's)\b/i).slice(0, 3).map((l) => ({ title: strip(l), detail: null, status: /agreed|confirmed/i.test(l) ? "confirmed" : "proposed", evidence: l })),
    actions: pick(/\b(will|to|I'll)\b/i).slice(0, 4).map((l) => ({ title: strip(l), detail: null, owner: name(l), due_on: null, blocker: /blocked/i.test(l) ? "See notes" : null, evidence: l })),
    questions: pick(/\?|tbc|not sure|didn't decide/i).slice(0, 3).map((l) => ({ title: strip(l), owner: name(l), evidence: l })),
    carried_updates: carried.slice(0, 1).map((c) => ({ item_id: c.id, suggested_status: c.kind === "action" ? "done" : "resolved", evidence: lines[2] ?? null })),
    follow_up_context: "Mock output. Set OPENAI_API_KEY and unset LLM_MOCK for real generation.",
  };
}

export function mockFollowUp(input: { meetingTitle: string; heldOn: string; items: Item[] }) {
  const act = input.items.filter((i) => i.kind === "action");
  const dec = input.items.filter((i) => i.kind === "decision");
  const qs = input.items.filter((i) => i.kind === "question");
  return [
    `Hi all, quick recap of ${input.meetingTitle} (${input.heldOn}).`,
    "",
    dec.length ? `Decisions\n${dec.map((d) => `- ${d.title}${d.status === "proposed" ? " (proposed, needs confirmation)" : ""}`).join("\n")}` : null,
    act.length ? `Actions\n${act.map((a) => `- ${a.title}: ${a.owner ?? "owner to be confirmed"}${a.due_on ? `, by ${a.due_on}` : ""}`).join("\n")}` : null,
    qs.length ? `Still open\n${qs.map((q) => `- ${q.title}${q.owner ? ` (${q.owner})` : ""}`).join("\n")}` : null,
    "",
    "Shout if I've missed anything.",
    "Arman",
  ]
    .filter((x) => x !== null)
    .join("\n");
}
