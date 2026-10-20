// Screenshots of every screen for design review. Dev-only.
// Usage: node scripts/shots.mjs [outDir] [--project <id>] [--width <px>]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import pg from "pg";

const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : dflt;
};
const out = argv.find((a) => !a.startsWith("--") && argv[argv.indexOf(a) - 1]?.startsWith("--") !== true) ?? ".shots";
const P = flag("--project", "00000000-0000-4000-8000-000000000001");
const width = Number(flag("--width", 1568));
mkdirSync(out, { recursive: true });
const base = "http://localhost:3000";

// Latest published meeting and latest draft with a draft on it, so both views are captured with real content.
const client = new pg.Client({ connectionString: process.env.DATABASE_URL ?? "postgres://momentum:momentum@localhost:5433/momentum" });
await client.connect();
const pub = (await client.query(`select id from meetings where project_id=$1 and status='published' order by held_on desc, created_at desc limit 1`, [P])).rows[0];
const draft = (await client.query(`select id from meetings where project_id=$1 and status='draft' and mom is not null order by created_at desc limit 1`, [P])).rows[0];
await client.end();

const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width, height: 900 } });
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
if (pub) {
  await shot("5-published", `/p/${P}/m/${pub.id}`);
  await shot("5b-published-scrolled", `/p/${P}/m/${pub.id}`, async () => {
    await page.mouse.move(600, 500);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(300);
  });
}
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
