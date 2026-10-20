// Drives the real flow in the installed Chrome and saves screenshots. Dev-only.
// Usage: node scripts/walk.mjs <outDir> [--generate]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? ".shots";
const generate = process.argv.includes("--generate");
mkdirSync(out, { recursive: true });
const base = "http://localhost:3000";
const P = "00000000-0000-4000-8000-000000000001";

const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: 1568, height: 900 }, deviceScaleFactor: 1 });
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
await page.getByPlaceholder("Meeting title").fill("Weekly sync");
await page.keyboard.press("Enter");
await page.waitForURL(/\/m\//);
await page.waitForTimeout(500);
await shot("editor-empty");
await page.getByRole("button", { name: "Use sample notes" }).click();
await page.waitForTimeout(400);
await shot("editor-notes");
if (generate) {
  await page.getByRole("button", { name: "Generate draft" }).click();
  await page.waitForTimeout(800);
  await shot("editor-generating");
  await page.getByText("Review, edit, then publish").waitFor({ timeout: 60000 });
  await page.waitForTimeout(600);
  await shot("editor-draft");
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(300);
  await shot("editor-draft-2");
}
console.log("done", generate ? "(with generation)" : "");
await b.close();
