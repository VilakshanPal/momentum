// Drives the real review flow in the installed Chrome and saves screenshots. Dev-only.
// Usage: node scripts/walk.mjs <outDir> [--generate] [--slow]
//   --generate runs generation, unticks one action, publishes
//   --slow holds the generate action for 16s so the progress state can be reviewed (the mock answers instantly otherwise)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? ".shots";
const generate = process.argv.includes("--generate");
const slow = process.argv.includes("--slow");
mkdirSync(out, { recursive: true });
const base = process.env.BASE ?? "http://localhost:3000";
const P = "00000000-0000-4000-8000-000000000001";

const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: 1568, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`${base}/?dev=yes`); // mock model: tests never spend OpenAI credits
const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });

// Board: open the status menu, screenshot it open, pick a value, confirm it persisted.
await page.goto(`${base}/p/${P}/board`);
await page.getByRole("button", { name: "Change status" }).nth(1).click();
await page.waitForTimeout(250);
await shot("board-menu-open");
await page.getByRole("menuitem", { name: /Done/ }).first().click();
await page.waitForTimeout(600);
await page.reload();
await shot("board-after-change");

// Editor: new meeting, sample notes, optionally generate.
await page.goto(`${base}/p/${P}`);
await page.getByRole("button", { name: "New meeting" }).click();
await page.waitForURL(/\/m\//);
await page.waitForTimeout(500);
await page.getByLabel("Meeting title").fill("Weekly sync");
await shot("editor-empty");
await page.getByRole("button", { name: "Use sample notes" }).click();
await page.waitForTimeout(400);
await shot("editor-notes");
if (generate) {
  const t0 = Date.now();
  await page.locator("textarea").first().focus();
  if (slow) {
    // generateDraft posts ["<meeting id>","<notes>"]; saveMeeting and autosave post an object second, so only the generate call is held.
    await page.route("**/*", async (route) => {
      const r = route.request();
      if (r.method() === "POST" && r.headers()["next-action"] && /^\["[^"]+","/.test(r.postData() ?? "")) await new Promise((res) => setTimeout(res, 16000));
      await route.continue();
    });
  }
  await page.keyboard.press("Control+Enter");
  await page.waitForTimeout(800);
  await shot("editor-generating");
  if (slow) {
    for (const at of [5, 10, 15]) {
      await page.waitForTimeout(5000);
      await shot(`editor-generating-${at}s`);
    }
  }
  await page.getByText("Everything ticked becomes a record").waitFor({ timeout: 60000 });
  await page.waitForTimeout(600);
  console.log("generated in", ((Date.now() - t0) / 1000).toFixed(1), "s");
  await shot("editor-draft");
  const before = await page.getByRole("button", { name: /^Publish/ }).innerText();
  // Reject the first action item, accept every carried-forward update.
  const boxes = page.locator("input[type=checkbox]");
  await boxes.nth(3).click();
  for (const cb of await page.locator("label input[type=checkbox]").all()) await cb.check();
  await page.waitForTimeout(300);
  const after = await page.getByRole("button", { name: /^Publish/ }).innerText();
  console.log("publish button:", before, "->", after);
  await page.mouse.move(1200, 500);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(300);
  await shot("editor-draft-reviewed");
  await page.waitForTimeout(1200); // autosave
  await page.getByRole("button", { name: /^Publish/ }).click();
  await page.getByText("Published.", { exact: false }).first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(600);
  await shot("published-banner");
  await page.getByRole("link", { name: "Open board" }).click();
  await page.waitForURL(/\/board/);
  await page.waitForTimeout(500);
  await shot("board-after-publish");
}
console.log("done", generate ? "(with generation)" : "");
await b.close();
