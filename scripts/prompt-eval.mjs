// Runs real notes through the generation prompt on the review stack and prints the drafts for a human read.
// Dev-only. Mock model by default; --real spends OpenAI credits (one generation per input), and only when Arman asks.
// Usage: node scripts/prompt-eval.mjs [--real] [--base http://localhost:3001] [--db postgres://...momentum_test]
// Inputs: sample call 3 (Design review) from src/lib/samples.ts, and any .txt files passed after the flags.
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import pg from "pg";

const args = process.argv.slice(2);
const real = args.includes("--real");
const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : "http://localhost:3001";
const db = args.includes("--db") ? args[args.indexOf("--db") + 1] : "postgres://momentum:momentum@localhost:5433/momentum_test";
if (base.includes(":3000") || db.endsWith("/momentum")) {
  console.error("Refusing to run against the working stack (:3000 / momentum). Use the review stack.");
  process.exit(1);
}
const P = "00000000-0000-4000-8000-000000000001";
const files = args.filter((a) => a.endsWith(".txt"));

const samples = readFileSync("src/lib/samples.ts", "utf8");
const call3 = samples.match(/n: 3,[\s\S]*?notes: `([\s\S]*?)`/)?.[1] ?? "";
const inputs = [{ name: "Sample call 3: Design review (24 Aug)", title: "Design review", date: "2026-08-24", notes: call3 }, ...files.map((f) => ({ name: f, title: "Prompt eval: " + f, date: "2026-10-19", notes: readFileSync(f, "utf8") }))];

const c = new pg.Client({ connectionString: db });
await c.connect();
const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${base}/?dev=${real ? "no" : "yes"}`);

for (const input of inputs) {
  await page.goto(`${base}/p/${P}`);
  await page.waitForLoadState("networkidle"); // hydration first, or the click lands on a form React has not taken over yet
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "New meeting" }).first().click();
  try {
    await page.waitForURL(/\/m\//, { timeout: 90_000, waitUntil: "commit" });
  } catch (e) {
    await page.screenshot({ path: ".shots/prompt-eval-failure.png" });
    console.error("could not open a new meeting; url:", page.url(), "| page says:", (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 300));
    throw e;
  }
  const mid = page.url().split("/m/")[1];
  await page.getByLabel("Meeting title").fill(input.title);
  await page.getByLabel("Meeting date").fill(input.date);
  await page.locator("textarea").first().fill(input.notes);
  const t0 = Date.now();
  await page.getByRole("button", { name: "Generate draft" }).click();
  await page.waitForFunction(() => !document.body.innerText.includes("Generating"), null, { timeout: 120_000 });
  await page.waitForTimeout(1000);
  const { rows } = await c.query("select mom, participants from meetings where id = $1", [mid]);
  const mom = rows[0]?.mom;
  console.log(`\n==== ${input.name} (${((Date.now() - t0) / 1000).toFixed(1)}s, ${real ? "REAL model" : "mock"}) ====`);
  if (!mom) {
    console.log("no draft stored; page said:", (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 300));
    continue;
  }
  console.log("participants:", mom.participants);
  console.log("summary:", mom.summary);
  console.log("discussion:");
  for (const d of mom.discussion_points) console.log("  -", d);
  for (const k of ["decisions", "actions", "questions"]) {
    console.log(`${k} (${mom[k].length}):`);
    for (const i of mom[k]) console.log("  -", JSON.stringify(i));
  }
  console.log("carried_updates:", JSON.stringify(mom.carried_updates));
  console.log("follow_up_context:", mom.follow_up_context);
  const missing = [...mom.decisions, ...mom.actions, ...mom.questions].filter((i) => !i.evidence).length;
  console.log(`evidence missing on ${missing} of ${mom.decisions.length + mom.actions.length + mom.questions.length} items`);
}
await b.close();
await c.end();
