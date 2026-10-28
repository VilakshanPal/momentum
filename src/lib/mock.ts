import type { Item, Mom } from "./schema";

// Development-only stand-in for the model. Golden drafts for known test inputs,
// a crude heuristic for anything else. Never used in production.

type Golden = Omit<Mom, "carried_updates"> & {
  carried_updates_by_title: { title_includes: string; suggested_status: string; evidence: string | null }[];
};

const GOLDEN: { key: string; mom: Golden }[] = [
  {
    key: "Aarohi design review - 24 Aug",
    mom: {
      participants: ["Nisha", "Tanvi", "Meera", "Rohan", "Kavya", "Arman"],
      summary:
        "Wireframes for the homepage and product page were approved with two changes: the made-in-Jaipur story moves above the bestsellers, and glaze variants become photo swatches. Vector logo files and the staging store are in. The photo shoot is on hold until Nisha clears the 45k quote with her sister, which blocks the homepage. Nisha signs off all copy and will write the first ten descriptions. Razorpay needs a business KYC. COD is parked for next week.",
      discussion_points: [
        "Nothing on the homepage works without the product photos.",
        "About 30% of WhatsApp customers ask for COD; breakage returns on COD are the risk.",
        "Nisha writes the first ten descriptions to set the tone; Tanvi may do the rest.",
        "International shipping still open, Nisha leaning no for launch.",
      ],
      decisions: [
        { title: "Story section moves above the bestsellers on the homepage", detail: null, status: "confirmed", evidence: "wants the story section (\"made in Jaipur\") higher up, above the bestsellers" },
        { title: "Glaze variants shown as photo swatches, not a dropdown", detail: "Some custom work in Dawn.", status: "confirmed", evidence: "Nisha wants the glaze variants shown as swatches with the actual photo changing, not a dropdown. Rohan says fine in Dawn with a bit of custom work" },
      ],
      actions: [
        { title: "Check the 45k photo shoot quote with her sister", detail: null, owner: "Nisha", due_on: null, blocker: null, evidence: "Nisha wasn't expecting that, needs to check with her sister before booking" },
        { title: "Write the first 10 product descriptions", detail: "Sets the tone for the rest.", owner: "Nisha", due_on: null, blocker: null, evidence: "Nisha will write the first 10 herself to set the tone, then we see" },
        { title: "List the documents needed for the Razorpay business KYC", detail: null, owner: "Kavya", due_on: null, blocker: null, evidence: "Kavya to list what documents Nisha needs" },
        { title: "Hi-fi homepage and product page", detail: null, owner: "Meera", due_on: "2026-08-31", blocker: null, evidence: "Meera to move to hi-fi for homepage and product page, next monday" },
      ],
      questions: [{ title: "Do we offer COD at launch?", owner: null, evidence: "parked, decide next week" }],
      follow_up_context: "COD decision and the shoot budget are due next Monday.",
      carried_updates_by_title: [
        { title_includes: "wireframes", suggested_status: "done", evidence: "Meera walked through the homepage and product page wireframes" },
        { title_includes: "Shopify store", suggested_status: "done", evidence: "store is set up, dev theme is on, Rohan shared the staging login with Tanvi" },
        { title_includes: "vector logo", suggested_status: "done", evidence: "vector logo files came in friday, Meera has them" },
        { title_includes: "photo shoot", suggested_status: "blocked", evidence: "so the shoot is on hold till that's sorted" },
        { title_includes: "signs off", suggested_status: "resolved", evidence: "Nisha confirmed she signs off everything, her sister doesn't want to be in the loop" },
      ],
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
  const name = (l: string) => l.match(/\b(Nisha|Tanvi|Meera|Rohan|Arjun|Kavya|Arman)\b/)?.[1] ?? null;
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
