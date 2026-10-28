// Walks the one-click demo path: Try it with sample notes -> typing -> generated draft. Dev-only, uses the mock model.
import { chromium } from "playwright";
const base = "http://localhost:3000";
const P = "00000000-0000-4000-8000-000000000001";
const out = ".shots/demo";
const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${base}/?dev=yes`); // mock model: tests never spend OpenAI credits
await page.goto(`${base}/p/${P}`);
await page.screenshot({ path: `${out}/1-project.png` });
const t0 = Date.now();
await page.getByRole("button", { name: "Try it with sample notes" }).click();
await page.waitForURL(/\/m\//);
console.log("url", page.url());
await page.getByText("Typing sample notes").waitFor({ timeout: 10_000 });
console.log("typing started at", ((Date.now() - t0) / 1000).toFixed(1), "s; url now", page.url());
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/2-typing.png` });
await page.getByText("Everything ticked becomes a record").waitFor({ timeout: 120_000 });
console.log("draft ready at", ((Date.now() - t0) / 1000).toFixed(1), "s");
console.log("notes chars", (await page.locator("textarea").first().inputValue()).length);
console.log("publish label", await page.getByRole("button", { name: /Publish/ }).innerText());
await page.screenshot({ path: `${out}/3-draft.png` });
await b.close();
