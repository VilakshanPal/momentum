// Worst-case fixture for break-ui. Dev-only. Adds a SECOND project next to the demo one (never truncates),
// using the longest values the schema accepts and the shapes real agency data produces.
// Usage: npx tsx scripts/seed-worst.ts   (remove: npx tsx scripts/seed-worst.ts --remove)
import { pool } from "../src/lib/db";
import type { Draft } from "../src/lib/schema";

export const WORST_PROJECT_ID = "00000000-0000-4000-8000-000000000002";
const M = (n: number) => `00000000-0000-4000-8000-0000000000${20 + n}`;

const LONG_TITLE_300 =
  "Rebuild the product listing, category and search result templates in Webflow with the new photography, migrate the 140 legacy blog posts with redirects, wire the HubSpot stylist-or-consumer field, and confirm with finance that Razorpay checkout handles EMI and COD before the 29 November launch window closes";
const LONG_OWNER_80 = "Aleksandra Wiśniewska-Kowalczyk (Northwind Industries Holdings, EMEA Marketing)";
const EMAIL_OWNER = "bartholomew.fitzgerald@northwind-industries-holdings.example.com";
const LONG_BLOCKER_500 =
  "Waiting on the new product photography from the 28 October shoot (photos promised by 3 November), the finance team's confirmation of the Razorpay merchant account for the new domain, legal sign-off on the revised privacy notice for the HubSpot form field, and the brand guidelines v3 PDF which marketing says is with the agency but the agency says is still with marketing; none of these have an owner on the client side yet and the Diwali campaign freeze starts on 10 November".slice(
    0,
    500,
  );
const LONG_EVIDENCE =
  "Rohan: honestly we can't build the product listing page properly without the photos, and even if we got placeholders in we'd have to redo the whole grid once the real shots land because the aspect ratios are different, so I'd rather call it blocked than pretend it's in progress. Priya: understood, I'll chase the shoot date again but realistically end of October is the earliest";

const participants30 = [
  LONG_OWNER_80,
  EMAIL_OWNER,
  "Jo",
  "李小龍 (Northwind APAC)",
  "Nguyễn Thị Phương Thảo",
  "Dana 🦄",
  "X Æ A-12",
  "Dr. Bartholomew Montgomery-Fitzgerald III",
  ...Array.from({ length: 22 }, (_, i) => `Attendee ${i + 1}`),
];

const draft: Draft = {
  participants: participants30,
  summary: Array.from({ length: 6 }, () => LONG_TITLE_300 + ".").join(" "),
  discussion_points: [LONG_TITLE_300, "Short.", "https://northwind-industries-holdings.example.com/wp-content/uploads/2026/10/brand-guidelines-v3-FINAL-final-USE-THIS-ONE.pdf", "x"],
  decisions: [
    { title: LONG_TITLE_300, detail: LONG_TITLE_300, status: "confirmed", evidence: LONG_EVIDENCE },
    { title: "Yes", detail: null, status: "proposed", evidence: null },
    { title: "Checkout stays on Razorpay 🦄 (not Stripe) for 李小龍's region", detail: null, status: "confirmed", evidence: "ok" },
  ],
  actions: [
    { title: LONG_TITLE_300, detail: LONG_TITLE_300, owner: LONG_OWNER_80, due_on: "2031-12-31", blocker: LONG_BLOCKER_500, evidence: LONG_EVIDENCE },
    { title: "Fix", detail: null, owner: EMAIL_OWNER, due_on: "2024-01-01", blocker: null, evidence: null },
    { title: "Send the thing", detail: null, owner: "Jo", due_on: null, blocker: "x", evidence: "x" },
    { title: "Nguyễn Thị Phương Thảo to review Vietnamese copy with ạ ặ ẵ ỵ diacritics", detail: null, owner: "Nguyễn Thị Phương Thảo", due_on: null, blocker: null, evidence: null },
    { title: "<b>Escape</b> &amp; **markdown** test {{template}}", detail: "<script>alert(1)</script>", owner: null, due_on: null, blocker: null, evidence: "<i>raw</i>" },
  ],
  questions: [
    { title: LONG_TITLE_300 + "?", owner: LONG_OWNER_80, evidence: LONG_EVIDENCE },
    { title: "?", owner: null, evidence: null },
  ],
  carried_updates: [],
  follow_up_context: LONG_TITLE_300,
};

const seedWorst = async () => {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await c.query(`delete from projects where id=$1`, [WORST_PROJECT_ID]);
    await c.query(`insert into projects (id, name, client, description) values ($1,$2,$3,$4)`, [
      WORST_PROJECT_ID,
      "Northwind Industries Holdings Group Rebrand, Website Replatform and CRM Migration (Phase II, EMEA and APAC)",
      "Northwind Industries Holdings Group plc (formerly Contoso-Fabrikam Consolidated)",
      LONG_TITLE_300,
    ]);

    const meeting = (n: number, title: string, held_on: string, who: string[], mom: Draft | null, status: "draft" | "published", notes = "") =>
      c.query(
        `insert into meetings (id, project_id, title, held_on, participants, raw_notes, mom, status, published_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8, case when $8='published' then $4::date + time '11:00' end)`,
        [M(n), WORST_PROJECT_ID, title, held_on, JSON.stringify(who), notes, mom ? JSON.stringify(mom) : null, status],
      );
    const item = (mid: string, kind: string, f: Record<string, unknown>, position: number) =>
      c
        .query<{ id: string }>(
          `insert into items (project_id, meeting_id, kind, title, detail, owner, due_on, status, blocker, evidence, supersedes_id, position)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id`,
          [WORST_PROJECT_ID, mid, kind, f.title, f.detail ?? null, f.owner ?? null, f.due_on ?? null, f.status, f.blocker ?? null, f.evidence ?? null, f.supersedes_id ?? null, position],
        )
        .then((r) => r.rows[0].id);

    // 1. Everything long, 30 people, 160-char title, published.
    const t160 = "Weekly client sync with Northwind marketing, agency design, dev, media and CRM teams plus the EMEA regional leads and APAC stakeholders (recorded on Fireflies)".slice(0, 160);
    await meeting(1, t160, "2026-09-01", participants30, draft, "published", Array.from({ length: 400 }, () => LONG_TITLE_300).join("\n"));
    const d1 = await item(M(1), "decision", { ...draft.decisions[0], status: "confirmed" }, 0);
    await item(M(1), "decision", { ...draft.decisions[1], status: "proposed" }, 1);
    await item(M(1), "decision", { ...draft.decisions[2], status: "confirmed" }, 2);
    await item(M(1), "action", { ...draft.actions[0], status: "blocked" }, 0);
    await item(M(1), "action", { ...draft.actions[1], status: "todo" }, 1);
    await item(M(1), "action", { ...draft.actions[2], status: "blocked" }, 2);
    await item(M(1), "action", { ...draft.actions[3], status: "in_progress" }, 3);
    await item(M(1), "action", { ...draft.actions[4], status: "done" }, 4);
    await item(M(1), "question", { ...draft.questions[0], status: "open" }, 0);
    await item(M(1), "question", { ...draft.questions[1], status: "open" }, 1);

    // 2. Exactly one of everything, one-letter person. Supersedes the long decision.
    const one: Draft = { ...draft, participants: ["Jo"], summary: "Short.", discussion_points: [], decisions: [draft.decisions[1]], actions: [draft.actions[2]], questions: [draft.questions[1]], follow_up_context: "" };
    await meeting(2, "1:1", "2026-09-08", ["Jo"], one, "published", "Jo: ok");
    await item(M(2), "decision", { title: "Supersedes the long one", detail: null, status: "confirmed", supersedes_id: d1 }, 0);
    await c.query(`update items set status='superseded' where id=$1`, [d1]);
    await item(M(2), "action", { title: "Send the thing", owner: "Jo", status: "todo" }, 0);
    await item(M(2), "question", { title: "?", status: "open" }, 0);

    // 3. Zero items, no participants, no notes.
    const empty: Draft = { participants: [], summary: "", discussion_points: [], decisions: [], actions: [], questions: [], carried_updates: [], follow_up_context: "" };
    await meeting(3, "Cancelled", "2026-09-15", [], empty, "published", "");

    // 4. Huge: 1,200 open actions and 300 questions.
    await meeting(4, "Backlog import", "2026-09-22", ["Jo"], { ...empty, summary: "Imported." }, "published", "import");
    const vals: unknown[] = [];
    const rows: string[] = [];
    for (let i = 0; i < 1200; i++) {
      rows.push(`($1,$2,'action',$${vals.length + 3},$${vals.length + 4},'todo',${i})`);
      vals.push(`Imported task ${i + 1}: ${LONG_TITLE_300.slice(0, 40 + (i % 200))}`, i % 7 ? participants30[i % 30] : null);
    }
    for (let i = 0; i < 300; i++) {
      rows.push(`($1,$2,'question',$${vals.length + 3},$${vals.length + 4},'open',${1200 + i})`);
      vals.push(`Imported question ${i + 1}?`, null);
    }
    await c.query(`insert into items (project_id, meeting_id, kind, title, owner, status, position) values ${rows.join(",")}`, [WORST_PROJECT_ID, M(4), ...vals]);

    // 5. Draft with a worst-case AI draft on it, dated after everything so 1,500+ items carry in.
    await meeting(5, "Draft with everything", "2026-10-20", participants30, draft, "draft", Array.from({ length: 60 }, () => LONG_TITLE_300).join("\n"));

    // 6. Empty draft, nothing typed yet.
    await meeting(6, "", "2026-10-21", [], null, "draft", "");

    await c.query("commit");
    console.log("worst-case project seeded:", WORST_PROJECT_ID);
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
    await pool.end();
  }
};

const main = async () => {
  if (!process.argv.includes("--remove")) return seedWorst();
  await pool.query(`delete from projects where id=$1`, [WORST_PROJECT_ID]);
  await pool.end();
  console.log("removed");
};
main();
