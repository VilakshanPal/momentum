// Times generation on notes near the 20k cap (Vercel function timeout risk). Dev-only, uses the real model.
// Usage: node scripts/long-notes.mjs
import { chromium } from "playwright";

const base = "http://localhost:3000";
const P = "00000000-0000-4000-8000-000000000001";
const people = ["Priya", "Meera", "Rohan", "Arjun", "Kavya", "Arman"];
const topics = [
  "the homepage hero copy still reads too long on mobile, Meera will cut it to two lines",
  "Razorpay sandbox keys are in, Rohan tested a 1 rupee order end to end and it went through",
  "Priya asked whether the blog redirects cover the old category pages too, Rohan to check the sitemap",
  "shoot is confirmed for the 28th, Priya will send the shot list on Friday",
  "Kavya says the HubSpot field spec went out yesterday, Rohan has not seen it, will resend",
  "store locator parked again, ops still has not replied about the store list",
  "Arjun wants the UTM parameters preserved through the new forms, Kavya to confirm with HubSpot support",
  "launch date 29 Nov still holds if photos land by 3 Nov, otherwise slip to 6 Dec, Priya to decide by the 5th",
  "founder copy review is Tuesday 10 Nov at 4pm, Priya booked it",
  "Meera asked about the font licence for the headline face, Priya thinks marketing owns it, will check",
  "nobody is sure whether the Hindi toggle is in scope, Arman says not for launch, Priya accepts for now",
  "Rohan flagged that the product filter needs the SKU list as data, Priya to export from Shopify",
];
const lines = [];
let t = 10 * 60;
while (lines.join("\n").length < 19_000) {
  const who = people[lines.length % people.length];
  const topic = topics[lines.length % topics.length];
  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  lines.push(`${mm}:${ss} ${who}: ${topic}${lines.length % 3 === 0 ? ", and yeah I think that is fine, let us move on" : ""}`);
  t += 37;
}
const notes = `Transcript: HAIRO x Catalys weekly, 27 Oct\nParticipants: ${people.join(", ")}\n\n${lines.join("\n")}`.slice(0, 19_900);
console.log("notes chars", notes.length);

const b = await chromium.launch({ channel: "chrome" });
const page = await b.newPage({ viewport: { width: 1568, height: 900 } });
await page.goto(`${base}/p/${P}`);
await page.getByRole("button", { name: "New meeting" }).click();
await page.getByPlaceholder("Meeting title").fill("Long transcript test");
await page.keyboard.press("Enter");
await page.waitForURL(/\/m\//);
await page.locator("textarea").first().fill(notes);
await page.waitForTimeout(1200);
const t0 = Date.now();
await page.locator("textarea").first().focus();
await page.keyboard.press("Control+Enter");
try {
  await page.getByText("Review, edit, then publish").waitFor({ timeout: 180_000 });
  console.log("generated in", ((Date.now() - t0) / 1000).toFixed(1), "s");
  const counts = await page.locator("h2:has-text('AI draft') ~ span .chip").allInnerTexts();
  console.log("counts", counts.join(" | "));
} catch {
  console.log("FAILED after", ((Date.now() - t0) / 1000).toFixed(1), "s");
  console.log(await page.locator(".text-red").allInnerTexts());
}
await page.screenshot({ path: ".shots/walk/long-notes.png" });
await b.close();
