// Screenshots of every screen for design review. Dev-only. Usage: node scripts/shots.mjs [outDir]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import pg from "pg";

const out = process.argv[2] ?? ".shots";
mkdirSync(out, { recursive: true });
const base = "http://localhost:3000";
const P = "00000000-0000-4000-8000-000000000001";

// Latest draft meeting, if any, so the editor can be captured with a real draft on it.
const client = new pg.Client({ connectionString: process.env.DATABASE_URL ?? "postgres://momentum:momentum@localhost:5433/momentum" });
await client.connect();
const draft = (await client.query(`select id from meetings where project_id=$1 and status='draft' and mom is not null order by created_at desc limit 1`, [P])).rows[0];
await client.end();

const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: 1568, height: 900 } });
const shot = async (name, url, after) => {
  await page.goto(`${base}${url}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
  if (after) await after();
  await page.screenshot({ path: `${out}/${name}.png` });
};

await shot("1-meetings", `/p/${P}`);
await shot("2-board", `/p/${P}/board`);
await shot("3-board-menu", `/p/${P}/board`, async () => {
  await page.getByRole("button", { name: "Change status" }).nth(1).click();
  await page.waitForTimeout(250);
});
await shot("4-decisions", `/p/${P}/decisions`);
await shot("5-published", `/p/${P}/m/00000000-0000-4000-8000-000000000012`);
if (draft) {
  await shot("6-editor-draft", `/p/${P}/m/${draft.id}`);
  await shot("7-editor-draft-scrolled", `/p/${P}/m/${draft.id}`, async () => {
    await page.mouse.move(1200, 500);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(300);
  });
}
console.log("saved to", out);
await b.close();
