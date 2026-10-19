import { pool } from "./db";
import type { Mom } from "./schema";

// Synthetic agency project. No real client data. Re-runnable: wipes everything first.
// Fixed IDs so demo links survive a reset.
export const DEMO_PROJECT_ID = "00000000-0000-4000-8000-000000000001";
const M1_ID = "00000000-0000-4000-8000-000000000011";
const M2_ID = "00000000-0000-4000-8000-000000000012";

const M1_NOTES = `HAIRO redesign kickoff - 6 Oct
attendees: Priya (HAIRO), Meera, Rohan, Arjun, Kavya, Arman

Priya: current site is on WordPress, slow, nobody internally can edit it. wants something the marketing team can update themselves
Rohan recommends Webflow. Priya ok with it as long as the blog can move. agreed - Webflow it is
Rohan to set up the Webflow workspace this week
Launch - Priya wants it before the Diwali campaign push, said 15 Nov would be ideal. we said we'd aim for that, depends on content
Meera needs brand guidelines, Priya said she'll send the PDF by thursday (9th)
Arjun asked whether landing pages for the paid campaigns live on the new site or stay on unbounce - parked, Priya to check with her CMO
Kavya: Hubspot forms need to carry over, no change to CRM
Domain - keep hairo.in, just repoint DNS at launch. Priya confirmed
Copy - who signs off on final copy? Priya thinks the founder wants to see it but not sure. left open
next sync tuesday 13th`;

const M1_MOM: Mom = {
  participants: [],
  summary:
    "Kickoff for the HAIRO website redesign. The team agreed to rebuild on Webflow, keep the hairo.in domain, and target a 15 November launch ahead of the Diwali campaign. Brand guidelines and copy sign-off ownership are outstanding on the client side.",
  discussion_points: [
    "Current WordPress site is slow and cannot be edited by HAIRO's marketing team.",
    "Webflow proposed by Rohan; accepted on the condition the blog can migrate.",
    "Paid-campaign landing pages: undecided whether they move to the new site or stay on Unbounce.",
    "HubSpot forms carry over unchanged; no CRM changes.",
  ],
  decisions: [
    {
      title: "Rebuild the site on Webflow",
      detail: "Replaces WordPress. Blog must migrate.",
      status: "confirmed",
      evidence: "Rohan recommends Webflow. Priya ok with it as long as the blog can move. agreed - Webflow it is",
    },
    {
      title: "Keep the hairo.in domain and repoint DNS at launch",
      detail: null,
      status: "confirmed",
      evidence: "Domain - keep hairo.in, just repoint DNS at launch. Priya confirmed",
    },
    {
      title: "Target launch date 15 November",
      detail: "Before the Diwali campaign push. Dependent on content readiness.",
      status: "proposed",
      evidence:
        "Priya wants it before the Diwali campaign push, said 15 Nov would be ideal. we said we'd aim for that, depends on content",
    },
  ],
  actions: [
    {
      title: "Set up the Webflow workspace",
      detail: null,
      owner: "Rohan",
      due_on: "2026-10-09",
      blocker: null,
      evidence: "Rohan to set up the Webflow workspace this week",
    },
    {
      title: "Share brand guidelines PDF with the design team",
      detail: null,
      owner: "Priya",
      due_on: "2026-10-09",
      blocker: null,
      evidence: "Meera needs brand guidelines, Priya said she'll send the PDF by thursday (9th)",
    },
    {
      title: "Check with CMO whether paid landing pages move to the new site",
      detail: "Currently on Unbounce.",
      owner: "Priya",
      due_on: null,
      blocker: null,
      evidence: "parked, Priya to check with her CMO",
    },
  ],
  questions: [
    {
      title: "Who at HAIRO signs off on final copy?",
      owner: null,
      evidence: "Priya thinks the founder wants to see it but not sure. left open",
    },
    {
      title: "Do we keep the existing domain?",
      owner: null,
      evidence: "Domain - keep hairo.in, just repoint DNS at launch.",
    },
  ],
  carried_updates: [],
  follow_up_context: "Next sync Tuesday 13 October.",
};

const M2_NOTES = `HAIRO design review - 13 Oct
Priya, Meera, Rohan, Arjun, Arman (Kavya out)

Meera walked through wireframes. Priya likes the direction, wants the hero to feature the product shots not lifestyle
Problem: product photography. the shots HAIRO has are old packaging. Priya says new shoot is happening but not till end of Oct
Rohan: can't build the product listing page properly without the photos, will be blocked
because of that launch slips - Priya ok to move launch to 29 Nov. everyone agreed
still waiting on brand guidelines PDF from Priya - she'll chase internally
Meera to move to hi-fi homepage mockups, target next Monday 20th
Arjun: CMO said landing pages stay on unbounce for now, revisit Q1. fine
Blog - do we actually migrate all 140 posts or just the last year? nobody sure. someone needs to confirm
Checkout - Rohan asked if they use Razorpay or Stripe, Priya didn't know, will find out from finance
Webflow workspace is set up, Rohan shared the invite`;

const M2_MOM: Mom = {
  participants: [],
  summary:
    "Design review of wireframes. Direction approved with a product-led hero. Missing product photography blocks the product listing page, so launch moves from 15 to 29 November. Brand guidelines are still outstanding. Paid landing pages stay on Unbounce.",
  discussion_points: [
    "Wireframes approved; hero should feature product shots rather than lifestyle imagery.",
    "New product shoot is not until end of October; existing shots show old packaging.",
    "Blog migration scope (all 140 posts vs. last year only) is unresolved.",
    "Webflow workspace is live and invites were shared.",
  ],
  decisions: [
    {
      title: "Launch moves to 29 November",
      detail: "Supersedes the 15 November target. Caused by product photography timing.",
      status: "confirmed",
      evidence: "because of that launch slips - Priya ok to move launch to 29 Nov. everyone agreed",
    },
    {
      title: "Paid landing pages stay on Unbounce until Q1",
      detail: null,
      status: "confirmed",
      evidence: "Arjun: CMO said landing pages stay on unbounce for now, revisit Q1. fine",
    },
  ],
  actions: [
    {
      title: "Build the product listing page",
      detail: null,
      owner: "Rohan",
      due_on: null,
      blocker: "Waiting on new product photography from HAIRO (shoot end of October)",
      evidence: "Rohan: can't build the product listing page properly without the photos, will be blocked",
    },
    {
      title: "Hi-fi homepage mockups",
      detail: "Product-led hero.",
      owner: "Meera",
      due_on: "2026-10-20",
      blocker: null,
      evidence: "Meera to move to hi-fi homepage mockups, target next Monday 20th",
    },
    {
      title: "Confirm blog migration scope (all 140 posts or last year only)",
      detail: null,
      owner: null,
      due_on: null,
      blocker: null,
      evidence: "nobody sure. someone needs to confirm",
    },
  ],
  questions: [
    {
      title: "Is checkout on Razorpay or Stripe?",
      owner: "Priya",
      evidence: "Rohan asked if they use Razorpay or Stripe, Priya didn't know, will find out from finance",
    },
  ],
  carried_updates: [],
  follow_up_context: "Brand guidelines PDF still pending from Priya. Next sync Monday 20 October.",
};

// Offered on the new-meeting screen so a judge can try generation without typing.
export const SAMPLE_NOTES = `HAIRO weekly - 20 Oct
Priya, Meera, Rohan, Kavya, Arman

Meera showed homepage hi-fi. Priya loves it, two tweaks - make the CTA orange not black, and shorten the hero copy. Meera will revise by wed
Brand guidelines FINALLY came through this morning, Meera has them
Photography - shoot confirmed for 28 Oct, photos to us by 3 Nov. Rohan still blocked on product page till then
Blog - Priya checked, migrate only the last 12 months (about 40 posts). older ones get redirected to the blog index. Rohan to scope the redirects
Checkout is Razorpay. Rohan said fine, there's a Webflow integration
Kavya: Hubspot form on the contact page needs a new field for "stylist or consumer" - she'll send the field spec
Priya asked if we can add a store locator. Rohan said maybe, depends on whether they have the store list as data. Priya will ask ops. not committing yet
29 Nov still looks ok if photos land on time
copy sign off - Priya says the founder does want to see final copy, she'll set up a 30 min review, date tbc`;

type ItemSeed = {
  title: string;
  detail?: string | null;
  owner?: string | null;
  due_on?: string | null;
  status: string;
  blocker?: string | null;
  evidence?: string | null;
  supersedes_id?: string | null;
  position: number;
};

export async function seed() {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await c.query("truncate items, meetings, projects cascade");

    const {
      rows: [p],
    } = await c.query<{ id: string }>(
      `insert into projects (id, name, client, description) values ($4, $1, $2, $3) returning id`,
      ["HAIRO Website Redesign", "HAIRO Haircare", "WordPress to Webflow rebuild. Agency team: design, dev, media, CRM.", DEMO_PROJECT_ID],
    );

    const participants = [
      "Priya Nair (HAIRO)",
      "Meera Shah (Design)",
      "Rohan Verma (Dev)",
      "Arjun Mehta (Media)",
      "Kavya Iyer (CRM)",
      "Arman (Catalys)",
    ];

    const insertMeeting = async (id: string, title: string, held_on: string, who: string[], notes: string, mom: Mom) => {
      const {
        rows: [m],
      } = await c.query<{ id: string }>(
        `insert into meetings (id, project_id, title, held_on, participants, raw_notes, mom, status, published_at)
         values ($7,$1,$2,$3,$4,$5,$6,'published', $3::date + time '11:00') returning id`,
        [p.id, title, held_on, JSON.stringify(who), notes, JSON.stringify(mom), id],
      );
      return m.id;
    };

    const m1 = await insertMeeting(M1_ID, "Kickoff", "2026-10-06", participants, M1_NOTES, M1_MOM);
    const m2 = await insertMeeting(
      M2_ID,
      "Design review",
      "2026-10-13",
      participants.filter((x) => !x.startsWith("Kavya")),
      M2_NOTES,
      M2_MOM,
    );

    const item = async (meeting_id: string, kind: "decision" | "action" | "question", f: ItemSeed) => {
      const {
        rows: [r],
      } = await c.query<{ id: string }>(
        `insert into items (project_id, meeting_id, kind, title, detail, owner, due_on, status, blocker, evidence, supersedes_id, position)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id`,
        [
          p.id,
          meeting_id,
          kind,
          f.title,
          f.detail ?? null,
          f.owner ?? null,
          f.due_on ?? null,
          f.status,
          f.blocker ?? null,
          f.evidence ?? null,
          f.supersedes_id ?? null,
          f.position,
        ],
      );
      return r.id;
    };

    // Meeting 1
    await item(m1, "decision", { ...M1_MOM.decisions[0], status: "confirmed", position: 0 });
    await item(m1, "decision", { ...M1_MOM.decisions[1], status: "confirmed", position: 1 });
    const launch15 = await item(m1, "decision", { ...M1_MOM.decisions[2], status: "superseded", position: 2 });
    await item(m1, "action", { ...M1_MOM.actions[0], status: "done", position: 0 });
    await item(m1, "action", { ...M1_MOM.actions[1], status: "todo", position: 1 }); // unresolved -> carried forward
    await item(m1, "action", { ...M1_MOM.actions[2], status: "done", position: 2 });
    await item(m1, "question", { ...M1_MOM.questions[0], status: "open", position: 0 }); // carried forward
    await item(m1, "question", { ...M1_MOM.questions[1], status: "resolved", position: 1 });

    // Meeting 2
    await item(m2, "decision", { ...M2_MOM.decisions[0], status: "confirmed", supersedes_id: launch15, position: 0 });
    await item(m2, "decision", { ...M2_MOM.decisions[1], status: "confirmed", position: 1 });
    await item(m2, "action", { ...M2_MOM.actions[0], status: "blocked", position: 0 });
    await item(m2, "action", { ...M2_MOM.actions[1], status: "in_progress", position: 1 });
    await item(m2, "action", { ...M2_MOM.actions[2], status: "todo", position: 2 });
    await item(m2, "question", { ...M2_MOM.questions[0], status: "open", position: 0 });

    await c.query("commit");
    return p.id;
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
}
