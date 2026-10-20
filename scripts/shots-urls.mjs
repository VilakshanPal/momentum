// Screenshot arbitrary paths. Dev-only. Usage: node scripts/shots-urls.mjs <outDir> <width> <path> [path...]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [out, width, ...paths] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: Number(width), height: 900 } });
for (const p of paths) {
  await page.goto(`http://localhost:3000${p}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
  const name = p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(-60);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log(name);
}
await b.close();
