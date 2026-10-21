// Renders src/app/opengraph-image.png (1200x630) and src/app/apple-icon.png (180x180) from the running app. Dev-only.
// Usage: node scripts/og.mjs   (dev server on :3000 with seeded data)
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const base = "http://localhost:3000";
const P = "00000000-0000-4000-8000-000000000001";
const b = await chromium.launch({ channel: "chrome" });

// 1. Product screenshot to embed: the published meeting view.
const app = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await app.goto(`${base}/p/${P}/m/00000000-0000-4000-8000-000000000012`);
await app.waitForTimeout(800);
const shot = (await app.screenshot({ type: "png" })).toString("base64");

// 2. Compose the card.
const svg = readFileSync("src/app/icon.svg", "utf8");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;width:1200px;height:630px;overflow:hidden;background:#f6f5f4;font-family:Inter,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:#0f0f0f;position:relative}
  .brand{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px;font-weight:600;font-size:26px;letter-spacing:-0.2px}
  .brand svg{width:40px;height:40px}
  h1{position:absolute;left:64px;top:132px;margin:0;width:560px;font-size:54px;line-height:1.08;letter-spacing:-1.6px;font-weight:700}
  p{position:absolute;left:64px;top:330px;margin:0;width:500px;font-size:22px;line-height:1.45;color:#31302e}
  .chips{position:absolute;left:64px;top:470px;display:flex;gap:10px}
  .chip{height:36px;padding:0 14px;border-radius:999px;background:#e8f2fc;color:#0075de;font-size:16px;font-weight:600;display:flex;align-items:center}
  .shot{position:absolute;left:660px;top:110px;width:1100px;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.08),0 24px 60px rgba(0,0,0,.14);border:1px solid #e6e6e6;background:#fff}
  .shot img{display:block;width:1100px}
</style></head><body>
  <div class="brand">${svg} MOMentum</div>
  <h1>Meeting notes to decisions, actions and open questions.</h1>
  <p>Paste rough notes or a transcript. Review every line before it becomes a record. Whatever stays open carries into the next meeting.</p>
  <div class="chips"><span class="chip">AI draft</span><span class="chip">Human review</span><span class="chip">Carried forward</span></div>
  <div class="shot"><img src="data:image/png;base64,${shot}"></div>
</body></html>`;
const card = await b.newPage({ viewport: { width: 1200, height: 630 } });
await card.setContent(html);
await card.waitForTimeout(300);
await card.screenshot({ path: "src/app/opengraph-image.png", type: "png" });

// 3. Apple touch icon from the SVG mark.
const icon = await b.newPage({ viewport: { width: 180, height: 180 } });
await icon.setContent(`<body style="margin:0">${svg.replace("<svg ", '<svg width="180" height="180" ')}</body>`);
await icon.screenshot({ path: "src/app/apple-icon.png", type: "png" });

await b.close();
console.log("wrote src/app/opengraph-image.png and src/app/apple-icon.png");
