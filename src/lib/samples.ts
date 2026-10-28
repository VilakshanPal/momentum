// The sample story: ten weekly calls on one Shopify build, kickoff to handover. Synthetic, no real client.
// Calls 1 and 2 are seeded as published history (minutes in seed.ts). Calls 3 to 10 are what visitors generate,
// one per click of "Try it with sample notes", in order. Read top to bottom to follow the project.

// Fixed id so demo links survive a reset.
export const DEMO_PROJECT_ID = "00000000-0000-4000-8000-000000000001";

export const DEMO_PROJECT = {
  name: "Aarohi Ceramics Shopify store",
  client: "Aarohi Ceramics",
  description: "Handmade tableware studio in Jaipur moving from Instagram DM and WhatsApp orders to a Shopify store. Agency team: design, dev, CRM, media.",
};

export type Sample = { n: number; title: string; held_on: string; notes: string };

export const SAMPLES: Sample[] = [
  {
    n: 1,
    title: "Kickoff",
    held_on: "2026-08-10",
    notes: `Aarohi Ceramics kickoff - 10 Aug
attendees: Nisha (Aarohi), Tanvi (Aarohi ops), Meera, Rohan, Kavya, Arman

Nisha: they sell handmade tableware from Jaipur, all orders come through Instagram DMs and WhatsApp right now. Tanvi types every order into a sheet by hand. about 90 products, lots of them come in 2 or 3 glazes
Rohan asked Shopify or WooCommerce. Nisha has a friend on Woo who hates it. agreed - Shopify, Basic plan to start
theme - Rohan suggests we just use Dawn as it comes and skin it. nobody objected, parked for Meera to look at
payments - Razorpay, Nisha already has an account for the WhatsApp payment links
domain - aarohiceramics.in is with GoDaddy, keep it, point it at Shopify at launch
launch - Nisha wants to be live before the festive season, said 28 Sep. we said doable if the catalogue sheet and photos are in on time
Tanvi to send the product sheet with prices and variants by friday
Nisha to send logo files and the colour palette, she thinks the designer has them
shipping - they use a local courier guy today, no tracking. Kavya suggested Shiprocket, Nisha hasn't heard of it, Kavya to send a short note on it
who writes product descriptions? Nisha writes the Instagram captions herself but 90 is a lot. left open
copy sign off - not clear if Nisha or her sister (co-founder) signs off. left open
next call monday 17th`,
  },
  {
    n: 2,
    title: "Catalogue and design direction",
    held_on: "2026-08-17",
    notes: `Aarohi catalogue + design direction - 17 Aug
Nisha, Tanvi, Meera, Rohan, Arman (Kavya out)

Tanvi sent the product sheet. 94 products, 61 have glaze variants, prices all there. Rohan says good enough to import
logo files came in but only PNGs, Meera needs the vector. Nisha to ask her designer for the AI or SVG files
Meera showed three reference stores. Nisha wants the earthy one, lots of white space, product photos big
theme - Meera says plain Dawn won't give her the homepage she wants. agreed - we customise Dawn, custom homepage and product page sections, rest of the theme stays stock
photos - current photos are phone shots on a kitchen table. Meera says they won't carry a site like this. Nisha to book a product shoot, she knows a photographer in Jaipur
Rohan to set up the Shopify store and a dev theme this week
shipping - Nisha read Kavya's note, happy to go with Shiprocket. agreed
Nisha asked about international shipping, her cousin in Dubai keeps asking. Rohan says Shiprocket does it but duties are messy. not deciding now
collections - by product type (plates, bowls, mugs, serveware) and a "sets" collection. agreed
Meera to do homepage and product page wireframes for next monday
descriptions still open, Nisha wants to see how the photos come out first`,
  },
  {
    n: 3,
    title: "Design review",
    held_on: "2026-08-24",
    notes: `Aarohi design review - 24 Aug
Nisha, Tanvi, Meera, Rohan, Kavya, Arman

Meera walked through the homepage and product page wireframes. Nisha likes it, wants the story section ("made in Jaipur") higher up, above the bestsellers
product page - Nisha wants the glaze variants shown as swatches with the actual photo changing, not a dropdown. Rohan says fine in Dawn with a bit of custom work
vector logo files came in friday, Meera has them
store is set up, dev theme is on, Rohan shared the staging login with Tanvi
photo shoot - photographer quoted 45k for two days. Nisha wasn't expecting that, needs to check with her sister before booking. so the shoot is on hold till that's sorted. Meera flagged that nothing on the homepage works without the photos
copy sign off - Nisha confirmed she signs off everything, her sister doesn't want to be in the loop
descriptions - Nisha will write the first 10 herself to set the tone, then we see. Tanvi may do the rest
Kavya: the Razorpay account is a personal one. for the store it needs a business KYC. Kavya to list what documents Nisha needs
COD - Tanvi says 30% of WhatsApp customers ask for COD. Rohan says Shopify can do it but breakage returns on COD are a risk. parked, decide next week
Meera to move to hi-fi for homepage and product page, next monday
international shipping - still open, Nisha leaning no for launch`,
  },
  {
    n: 4,
    title: "Design sign-off and checkout",
    held_on: "2026-08-31",
    notes: `Aarohi design sign off + checkout - 31 Aug
Nisha, Tanvi, Meera, Rohan, Kavya, Arman

Meera showed the hi-fi homepage and product page. Nisha signed off, one change - the hero text should be in her own words, she'll send a line
shoot - Nisha's sister agreed to the 45k. shoot booked for 9 and 10 Sep, edited photos promised by 16 Sep. Rohan says that's tight for the 28 Sep launch but ok
COD - decided yes, with a cap. COD only for orders under 3000 and not on the large serveware pieces. Rohan to set that up as a shipping rule
returns - Nisha only wants to replace items that arrive broken, no change-of-mind returns. 7 days from delivery, photo required. Kavya to draft the returns page text
Razorpay KYC - Kavya sent the document list. Nisha needs a cancelled cheque and the GST certificate, she'll send them this week. Kavya to file the KYC once they're in
Nisha's first 10 descriptions came through. Meera says the tone is lovely. Tanvi to write the remaining 84 in the same style, Nisha reviews. Tanvi thinks 2 weeks
Rohan started the product import. the glaze variants in the sheet aren't consistent (some say "Sea green", some "Seagreen"). Tanvi to clean the sheet
gift wrapping - Nisha asked if customers can add gift wrap. Rohan says there are apps or a simple add-on product. nobody decided, Rohan to check cost
international shipping - Nisha decided no for launch. India only. revisit after Diwali`,
  },
  {
    n: 5,
    title: "Build week 1",
    held_on: "2026-09-07",
    notes: `Aarohi build update - 7 Sep
Nisha, Tanvi, Meera, Rohan, Kavya, Arman

Rohan: homepage sections are built on the dev theme with placeholder photos. product page swatches work. Nisha saw it on staging, happy
product import - Tanvi cleaned the sheet, 94 products in with variants. Rohan says a handful of prices looked off, Tanvi to double check the serveware prices
shoot is happening wed and thu this week. Meera is going to Jaipur to art direct it. photos still due 16 Sep
Razorpay KYC - Nisha sent the cheque and GST cert, Kavya filed it friday. Razorpay says 5 to 7 working days
hero line from Nisha - not yet. she'll send it tonight
gift wrap - Rohan checked, the app is 10 dollars a month, an add-on product is free. we suggest the add-on product at 150 rupees, Nisha likes it but wants to see it on the cart first. proposed for now
Kavya raised order notifications - customers are used to WhatsApp updates from Tanvi. Shopify sends email and SMS. Kavya to look at a WhatsApp app (Interakt or similar) and cost
Nisha asked whether we should have a wholesale page for the cafes that buy from her. Rohan says it's a different thing (price lists, login). open, not for launch probably
Tanvi on descriptions - 30 done of 84, on track for the 18th`,
  },
  {
    n: 6,
    title: "Build week 2, payments and shipping",
    held_on: "2026-09-14",
    notes: `Aarohi build update - 14 Sep
Nisha, Tanvi, Meera, Rohan, Kavya, Arman

shoot went well, Meera came back with 600 raw shots. editing takes longer than promised - photographer now says 22 Sep for the edited set, not 16 Sep
Razorpay KYC is still pending, Razorpay asked for a bank letter on top of the cheque. Nisha to get that from her bank. Kavya says it will be another week after that
with photos on 22 Sep and payments maybe 25 Sep there's no way to launch on 28 Sep safely. Arman proposed 5 Oct. Nisha agreed, still before Navratri so she's ok with it. launch is 5 Oct now
Shiprocket - account is live, Rohan connected it. Rohan to set up the rate table: free shipping over 2500, flat 120 under that, plus the COD rule
GST invoices - Nisha's accountant wants GST invoices on every order. Rohan says Shopify doesn't do GST invoices natively, we need an app. agreed - use a GST invoice app, Rohan to pick one
WhatsApp notifications - Kavya looked at Interakt, 999 a month. Nisha wants it. agreed, Kavya to set it up after launch, email notifications are enough for launch itself
packaging - Tanvi worried about breakage with a new courier. Tanvi to do a test shipment of 5 pieces to Delhi and Bangalore via Shiprocket before launch
descriptions - 55 of 84 done
hero line came in, Meera has put it in
international - someone asked again on Instagram. still no for launch, Nisha firm on that`,
  },
  {
    n: 7,
    title: "Content and QA",
    held_on: "2026-09-21",
    notes: `Aarohi content + QA - 21 Sep
Nisha, Tanvi, Meera, Rohan, Kavya, Arjun, Arman

photos - edited set landed this morning, a day early. Meera is going through them, Rohan starts dropping them in tomorrow
Razorpay - bank letter went in, KYC approved thursday. live mode is on. Rohan did a 10 rupee test order, worked
QA - Arman started a bug list on the shared sheet. 14 items so far, mostly mobile spacing and the cart drawer. Rohan to go through it this week
gift wrap - Nisha saw the add-on on the cart, likes it. confirmed, 150 rupees add-on product
shipping rates are in. Rohan tested free shipping over 2500 and the COD cap, both fine
Arjun joined for the first time - he'll run the launch posts and a small Meta campaign. needs the Meta pixel and the Instagram shop connected. Rohan to install the pixel, Arjun to set up the Instagram shop with Nisha's account
descriptions - Tanvi is at 70 of 84, promised the last 14 by wednesday
Nisha asked what happens to Instagram DM orders after launch. Tanvi can't run both. not decided, Nisha to think about it
wholesale page - Nisha decided it's phase 2, after Diwali. closed for now
test shipment - Tanvi sent 5 pieces to Delhi and Bangalore last week, all arrived, one chipped mug. Tanvi to add more bubble wrap on mugs, otherwise ok
UAT with Nisha and Tanvi next monday, full walkthrough on staging`,
  },
  {
    n: 8,
    title: "UAT walkthrough",
    held_on: "2026-09-28",
    notes: `Transcript: Aarohi Ceramics x Catalys - UAT walkthrough, 28 Sep
Participants: Nisha, Tanvi, Rohan, Meera, Kavya, Arman

[00:00:12] Arman: Nisha, Tanvi, you both had the staging link since friday. Let's go through what you found.
[00:00:30] Nisha: Overall it looks beautiful. The photos make it. I have a list though.
[00:00:41] Nisha: First, on the phone the glaze swatches are tiny, I couldn't tap the right one.
[00:01:02] Rohan: Known, it's on the bug list. I'll make them bigger, 44 pixels at least.
[00:01:15] Tanvi: Second, when I placed a COD order it still asked for a card. The COD option didn't show.
[00:01:30] Rohan: What was the cart value?
[00:01:33] Tanvi: Around 3400.
[00:01:40] Rohan: Then it's correct, COD is only under 3000. We decided that on the 31st.
[00:01:52] Tanvi: Oh right. Fine. Then that one's not a bug.
[00:02:10] Nisha: The sets collection has two sets with the wrong price, the dinner set for 6 shows the price of the set for 4.
[00:02:25] Tanvi: That's my sheet. I'll fix those two in Shopify directly today.
[00:02:40] Meera: On the about page the founder photo is stretched on desktop. I'll send Rohan a cropped version.
[00:03:05] Kavya: Returns page text is up, Nisha did you read it?
[00:03:12] Nisha: Yes, approved, just change "7 days" to "7 days from delivery" everywhere.
[00:03:30] Arman: Launch checklist. Domain. Nisha, do you have the GoDaddy login?
[00:03:42] Nisha: My sister has it. I'll get it to Rohan by wednesday.
[00:03:55] Rohan: I need it by thursday latest to point the DNS and get the SSL in before monday.
[00:04:10] Arman: Instagram DMs after launch, Nisha, did you decide?
[00:04:20] Nisha: Yes. From launch day, Tanvi replies to every DM order with the site link. No more manual orders. I'll post about it the day before.
[00:04:40] Tanvi: Thank god.
[00:04:50] Arman: Descriptions?
[00:04:55] Tanvi: All 84 are in. Nisha reviewed them yesterday.
[00:05:10] Arman: Arjun is not on the call but he messaged, the pixel is firing on staging and the Instagram shop is pending Meta review, they said 2 to 3 days.
[00:05:30] Nisha: One more thing. Can we have a launch offer, 10 percent off the first week?
[00:05:45] Rohan: Discount code is five minutes. What code?
[00:05:50] Nisha: HELLO10. Agreed.
[00:06:05] Arman: Ok. Rohan clears the bug list by thursday, Tanvi fixes the two prices today, Meera sends the crop, Nisha gets the GoDaddy login by wednesday. Go live monday 5 Oct, 10 am.
[00:06:30] Nisha: Perfect.`,
  },
  {
    n: 9,
    title: "Launch day",
    held_on: "2026-10-05",
    notes: `Aarohi launch day - 5 Oct
Nisha, Tanvi, Meera, Rohan, Kavya, Arjun, Arman

site went live at 10:40, DNS took a bit longer than Rohan expected. SSL fine
Nisha posted at 11, by 3 pm 23 orders. she's thrilled. Tanvi says 9 of those were DM customers she pointed at the site
issue - cart drawer doesn't open on some iPhones, Safari only. Rohan found it, it's the theme update from last week, he'll hotfix tonight. 3 customers messaged about it
HELLO10 is working, 19 of 23 used it
Instagram shop got approved this morning, Arjun connected it. the Meta campaign starts wednesday, 500 a day for 2 weeks
one COD order placed on a 2800 cart, correct
Shiprocket - Tanvi shipped 11 orders by 5 pm, labels printing fine
GST invoice app - working, Nisha's accountant got the first invoice email and is happy
Nisha wants to know when WhatsApp notifications go live. Kavya says Interakt setup this week, live by the 12th
Tanvi asked if she can edit product descriptions herself. yes, Rohan to do a 1 hour training session for Nisha and Tanvi next week
Nisha asked about a retainer for ongoing changes after handover. Arman to send a proposal
next call monday 12th, handover`,
  },
  {
    n: 10,
    title: "Handover and close",
    held_on: "2026-10-12",
    notes: `Aarohi handover - 12 Oct
Nisha, Tanvi, Rohan, Kavya, Arman

first week numbers - 112 orders, 3.1 lakh. Nisha's best week ever, previous best on WhatsApp was 40 orders
cart drawer hotfix went in on launch night, no complaints since
training done on thursday, Nisha and Tanvi can add products, edit descriptions and change prices. Rohan shared a short Loom as well
WhatsApp notifications are live since friday via Interakt. Tanvi says customers already reply to them
Meta campaign - Arjun says ROAS is about 4x in the first 5 days. Nisha wants to keep it running through Diwali, she'll confirm the budget with Arjun directly
two breakage replacements so far out of 112, both mugs. Tanvi has changed the packing
retainer - Nisha read the proposal. agreed on the 10 hours a month option starting November
Nisha asked for international shipping and the wholesale page as phase 2 after Diwali. Arman to scope both in November
handover complete, staging theme deleted, Nisha has owner access on Shopify
Nisha thanked the team. project closed`,
  },
];

export const sampleByNo = (n: number | null | undefined) => SAMPLES.find((s) => s.n === n) ?? null;
