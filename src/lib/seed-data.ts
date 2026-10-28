// A believable agency workspace beside the Aarohi Ceramics story: three more clients, four projects, seven published meetings
// with their notes and minutes, board items with the statuses and dates a real October would have, and a few comments.
// Everything here is synthetic. Brands, people and emails are invented; any resemblance is accidental.
// Evidence strings are exact lines from the notes they sit under, because that is the product's promise.

export type SeedComment = { author: string | null; body: string; at: string };
export type SeedItem = {
  kind: "decision" | "action" | "question";
  title: string;
  detail?: string | null;
  owner?: string | null;
  due_on?: string | null;
  status: string;
  blocker?: string | null;
  evidence?: string | null;
  comments?: SeedComment[];
};
export type SeedMeeting = {
  id: string;
  title: string;
  held_on: string;
  held_time: string;
  participants: string[];
  notes: string;
  summary: string;
  discussion_points: string[];
  follow_up_context: string;
  items: SeedItem[];
  // Status changes this meeting made to items from the earlier meeting of the same project, matched by a title fragment.
  carried_updates?: { title_includes: string; status: string; evidence: string }[];
};
export type SeedProject = { id: string; name: string; description: string; team: string[]; meetings: SeedMeeting[]; board?: SeedItem[] };
export type SeedClient = { id: string; brand: string; name: string; email: string; projects: SeedProject[] };

export const EXTRA_PEOPLE: { name: string; role: string; email: string }[] = [
  { name: "Priya Nair", role: "Content", email: "priya@catalys.co" },
  { name: "Sameer Bhatt", role: "Performance", email: "sameer@catalys.co" },
];

const BLUEFIN_WEB_1 = `Bluefin Pay x Catalys: sprint review
Ananya Krishnan (Bluefin): 00:00
 Thanks for making time. Karthik is on from product, he owns the docs side.

Meera Shah (Catalys): 00:14
 I'll share my screen. Pricing page first. Three tiers as agreed, Starter, Growth, Enterprise, with the per-transaction fee under each and the volume slider on the right.

Karthik Rao (Bluefin): 01:02
 The slider is good. One thing, the Enterprise tier should not show a price at all, it should say talk to sales. Legal was clear about that.

Meera Shah (Catalys): 01:20
 Noted, Enterprise shows talk to sales, no number.

Ananya Krishnan (Bluefin): 01:31
 Agreed, and the Growth tier is the one we want people to land on, so make it the highlighted card.

Rohan Verma (Catalys): 02:05
 On the docs entry points. The old site had 140 doc pages under /developers. We are not rebuilding docs, we link out to docs.bluefinpay.in, but the top eight pages need redirects from the old URLs so Google does not drop them.

Karthik Rao (Bluefin): 02:40
 I can send you the full list of old doc URLs with traffic by Thursday. The top eight is easy, I want the whole list so nothing 404s.

Rohan Verma (Catalys): 02:58
 Perfect, send the whole list and I'll build the redirect map from it.

Priya Nair (Catalys): 03:20
 Copy. The homepage hero is done and approved. The pricing page copy I will draft this week, I need the fee numbers confirmed first.

Ananya Krishnan (Bluefin): 03:41
 Fees are confirmed, 1.9 percent on Starter, 1.6 on Growth, Enterprise negotiated. I'll put it in writing today.

Arman (Catalys): 04:10
 Launch date. We said 10 November. Does that still hold on your side?

Ananya Krishnan (Bluefin): 04:22
 It holds if the SOC 2 badge is ready. Compliance says the audit letter lands by 30 October, and I do not want to launch without the badge on the trust page.

Arman (Catalys): 04:48
 Understood, launch stays 10 November, dependent on the SOC 2 letter by 30 October.

Karthik Rao (Bluefin): 05:05
 One open thing. Do we keep the blog on the new site or move it to Medium? Marketing is split.

Ananya Krishnan (Bluefin): 05:20
 Let's not decide that today. I'll take it to the marketing lead.

Arman (Catalys): 05:33
 Fine, we'll park the blog question. Next review is Wednesday the 22nd for the pre-launch checklist.`;

const BLUEFIN_WEB_2 = `Bluefin pre-launch checklist, 22 Oct, 4pm
Ananya, Karthik, Rohan, Sameer, Arman

- redirect map: Karthik's list came in (212 URLs). Rohan built the map, 198 mapped, 14 old pages have no equivalent, they go to the docs home. agreed - the 14 go to docs home with a note
- pricing page copy is live on staging, Ananya approved it on the call. Enterprise reads talk to sales. done
- SOC 2: audit letter is delayed, compliance now says 4 November. Ananya: we cannot launch the trust page without it. Arman proposed launching everything except the trust page on 10 Nov and adding the badge when the letter lands. Ananya agreed. launch stays 10 Nov, trust page follows
- performance: Sameer ran Lighthouse on staging, mobile score 71. the hero video is 9 MB. Sameer to compress the hero video and re-run, target 90 plus
- analytics: GA4 and the Bluefin product events need the same user id. Karthik to share the event spec by Monday 27th
- forms: the contact form posts to HubSpot. test submission went through but landed in the wrong pipeline. Rohan to fix the pipeline mapping, Ananya to confirm which pipeline (sales or partnerships)
- blog: still undecided. Ananya's marketing lead wants it on the new site, Karthik still prefers Medium. Ananya will decide by Friday 24th
- DNS cutover: Bluefin's IT does it, needs a 48 hour notice. Arman to send the cutover runbook by 3 November
- open: who writes the launch announcement? nobody owned it. left open`;

const BLUEFIN_CONTENT_1 = `Bluefin Pay content planning, 15 Oct
Ananya, Priya, Arjun, Arman

Ananya wants two long pieces a month from Vikram (the CEO) and a weekly LinkedIn post. Vikram has 30 minutes a week, no more.
Priya: then we interview him, 30 minutes on a call, and write from the transcript. He reviews, we publish. agreed - interview format, Priya runs the calls
first two topics - Ananya likes "why payment failures are a product problem" and "what we learned onboarding 400 merchants". agreed on both for October and November
Arjun on distribution: LinkedIn posts go out Tuesday and Thursday mornings. Company page plus Vikram's profile. boosted with 15k a month, Ananya confirmed the budget
Ananya asked whether we should also do a podcast. Priya thinks not yet, there is no audience to pull from. parked, revisit in January
Priya to send the interview questions for topic one by Friday 17th
Arjun to set up the LinkedIn posting calendar and share it, by Monday 20th
Ananya to get Vikram's 30 minute slot booked weekly, first one next Wednesday 22nd
open - who signs off on each piece before it goes out, Ananya or Vikram? Ananya thinks Vikram will want final say. not settled`;

const JUNO_1 = `Juno Kids festive campaign kickoff, 7 Oct
Farhan Sheikh (Juno), Ritu Agarwal (Juno ops), Arjun, Kavya, Meera, Arman

Farhan: last year Diwali was 40 percent of Q4 revenue, all from Instagram ads and one email. This year the budget is 18 lakh, Diwali through New Year.
split - Arjun proposed 70 percent Meta, 30 percent Google Shopping. Farhan agreed. agreed - 70/30 Meta and Google, reviewed every two weeks
collections - three festive collections, Diwali ethnic, winter knits, and the gifting sets. each gets its own landing page. Meera to design one template, three variants
creative - Juno has a shoot on the 12th. Ritu to send the edited photos by the 15th. Arjun needs them for the first ads on the 18th
catalogue - the Meta catalogue has 300 products but sizes are wrong on half of them. Kavya to fix the size mapping in the feed before the catalogue ads go live
email - Kavya proposed a four-email Diwali series. Farhan wants the first one on the 20th. agreed - four emails, first on the 20th
COD - Ritu says 60 percent of orders are COD and returns are 18 percent. Arjun suggested prepaid-only on the gifting sets. Farhan is not sure, wants to see numbers. left open
Farhan asked if we can run WhatsApp broadcasts too. Kavya: possible with their WATI account, but it needs opt-ins. Farhan to check how many opted-in numbers they have
next review on the 21st with the first two weeks of data`;

const JUNO_2 = `Juno Kids week two review
Arjun Mehta (Catalys): 00:00
 First two weeks. Spend 4.1 lakh, revenue 11.8 lakh, so ROAS 2.9 against the 3.0 target. Diwali ethnic is doing 3.8, winter knits 1.4, gifting is 2.6.

Farhan Sheikh (Juno): 00:32
 Knits is the problem. Mumbai is still 32 degrees, nobody is buying knits in October.

Arjun Mehta (Catalys): 00:45
 Agreed. I'd pause knits until the first week of November and move that budget to Diwali ethnic while it is hot.

Farhan Sheikh (Juno): 00:58
 Do it. Pause knits, move the budget to ethnic, bring knits back in November.

Ritu Agarwal (Juno): 01:15
 Returns on ethnic are 22 percent, mostly size. The size chart on the landing page is the old one.

Meera Shah (Catalys): 01:30
 I'll update the size chart on all three landing pages today, the new chart Ritu sent last week.

Kavya Iyer (Catalys): 01:50
 Catalogue. The size mapping is fixed, but Meta has not approved the catalogue yet, it has been in review for six days. I've raised it with Meta support.

Farhan Sheikh (Juno): 02:10
 Can we escalate through the Meta rep? We have one from the agency onboarding.

Arjun Mehta (Catalys): 02:20
 Yes, I'll ping the rep today and copy you.

Kavya Iyer (Catalys): 02:40
 Email one went out on the 20th, 34 percent open, 4.2 percent click, 61 orders. Email two is scheduled for the 27th.

Farhan Sheikh (Juno): 03:00
 Good. On COD, I looked at the numbers. Prepaid only on gifting sets, with a 5 percent prepaid discount. Let's go with that.

Arjun Mehta (Catalys): 03:15
 Confirmed, gifting sets prepaid only with 5 percent off. Kavya can switch that on Shopify.

Kavya Iyer (Catalys): 03:25
 I'll do it tomorrow morning before the ads refresh.

Ritu Agarwal (Juno): 03:40
 WhatsApp, we have 9,400 opted-in numbers. Is that enough for a broadcast?

Kavya Iyer (Catalys): 03:50
 Enough for a test. Let's do one broadcast on the gifting sets next week and see.

Farhan Sheikh (Juno): 04:05
 Fine, one broadcast as a test. And the New Year creative, when do we need to start?

Arjun Mehta (Catalys): 04:15
 Shoot by the 10th of November if we want ads on the 20th. Nobody has booked it yet.

Farhan Sheikh (Juno): 04:28
 Ritu, can you check with the photographer on dates? Don't book yet.

Ritu Agarwal (Juno): 04:35
 Will check and come back by Friday.`;

const SERAI_1 = `Serai Hotels discovery
Devika Menon (Serai): 00:00
 We have two properties, Goa and Jaipur, 14 and 22 rooms. 70 percent of bookings come through Booking.com and MakeMyTrip, and we pay 18 to 22 percent commission on those.

Arman (Catalys): 00:30
 So the goal is to move a meaningful share of that to direct bookings.

Devika Menon (Serai): 00:40
 Yes. If we get direct to 35 percent in a year, the site pays for itself four times over.

Rohan Verma (Catalys): 01:05
 On the booking engine, you are on a spreadsheet and WhatsApp today. The options are a hosted engine like Little Hotelier or Cloudbeds, or a custom flow on Razorpay. Hosted is faster and handles the channel manager, custom is prettier and cheaper per booking.

Devika Menon (Serai): 01:40
 I need the channel manager. We double-booked twice last season. Hosted it is, as long as it does not look like every other hotel site.

Meera Shah (Catalys): 02:00
 The brand is where that comes from. Your photos are strong. I want the site to feel like the properties, lots of white space, the Jaipur blues, the Goa laterite. Not a template.

Devika Menon (Serai): 02:25
 That is exactly it. The current site looks like a 2015 travel agency.

Rohan Verma (Catalys): 02:40
 Languages. You said Hindi and English. Does the booking flow need Hindi too, or just the marketing pages?

Devika Menon (Serai): 02:55
 Marketing pages in both. The booking flow can stay English, most of our guests book in English anyway.

Arman (Catalys): 03:10
 So marketing in Hindi and English, booking flow in English only. Agreed.

Devika Menon (Serai): 03:20
 Agreed.

Rohan Verma (Catalys): 03:30
 I'll shortlist two hosted engines with pricing and a demo of each, and bring it to the next call.

Meera Shah (Catalys): 03:45
 I'll do a moodboard and two homepage directions.

Devika Menon (Serai): 04:00
 I'll get you the photo library and the rate cards. One question I cannot answer yet, whether we take the restaurant bookings on the site too. The Goa restaurant is half our walk-ins.

Arman (Catalys): 04:20
 We'll keep that open and look at it after the booking engine is chosen.`;

const SERAI_2 = `Serai booking engine decision, 16 Oct
Devika, Rohan, Sameer, Arman

Rohan showed the two options. Little Hotelier, 9,500 a month for two properties, channel manager included, booking widget is iframe only. Cloudbeds, 14,000 a month, API access so we can build our own booking page, channel manager included.
Devika asked about the iframe. Meera's designs would not survive an iframe widget. Rohan: with Cloudbeds we build the booking page ourselves and it stays on brand.
agreed - Cloudbeds. Devika signed off on the 14,000, the design matters more than the 4,500 difference
Devika will sign the Cloudbeds contract this week and share the API keys with Rohan
Rohan to build the booking page on the Cloudbeds API, first working version by 6 November
photos - the library came in, 600 images. Meera is picking the hero set. Devika approved direction B, the one with the full-bleed Jaipur courtyard
Sameer on search: the Goa property ranks for nothing. "boutique hotel Goa" is owned by the aggregators. Sameer proposed going after "heritage stay Jaipur" and "Assagao villa hotel" instead, where the competition is thin. Devika agreed. agreed - target the two long-tail terms first
rate cards - Devika sent them, but the Jaipur rates are from last season. Devika to send the current Jaipur rates by Thursday 23rd
restaurant bookings - still open. Devika is leaning yes for Goa only. Rohan says Cloudbeds does not do restaurant reservations, it would be a separate tool. parked till the booking page is live
Sameer to set up Search Console and the rank tracking for both properties, by Monday 20th`;

export const EXTRA_CLIENTS: SeedClient[] = [
  {
    id: "00000000-0000-4000-8000-00000000c001",
    brand: "Bluefin Pay",
    name: "Ananya Krishnan",
    email: "ananya@bluefinpay.in",
    projects: [
      {
        id: "00000000-0000-4000-8000-00000000a001",
        name: "Bluefin Pay website relaunch",
        description: "Marketing site rebuild with a new pricing page, developer docs entry points and the SEO migration off the old WordPress site. Launch 10 November.",
        team: ["Meera Shah", "Rohan Verma", "Priya Nair", "Sameer Bhatt", "Arman"],
        meetings: [
          {
            id: "00000000-0000-4000-8000-0000000a0101",
            title: "Sprint review: pricing page and docs",
            held_on: "2026-10-13",
            held_time: "11:00",
            participants: ["Ananya Krishnan (Bluefin)", "Karthik Rao (Bluefin)", "Meera Shah", "Rohan Verma", "Priya Nair", "Arman"],
            notes: BLUEFIN_WEB_1,
            summary: "The pricing page direction was approved with two changes: Enterprise shows talk to sales instead of a price, and Growth becomes the highlighted tier. Docs stay on their own domain, with redirects for the old URLs once Karthik sends the full list. Launch holds at 10 November, dependent on the SOC 2 audit letter arriving by 30 October. The blog's home is still undecided.",
            discussion_points: [
              "Legal does not want an Enterprise price shown anywhere on the site.",
              "The old site had about 140 documentation pages; the new site links out to docs.bluefinpay.in rather than rebuilding them.",
              "Fees are confirmed at 1.9 percent on Starter and 1.6 percent on Growth, with Enterprise negotiated.",
              "Ananya will not launch the trust page without the SOC 2 badge.",
            ],
            follow_up_context: "The 22 October review needs the redirect map built from Karthik's list, the pricing copy on staging, and a date for the SOC 2 letter. The blog decision is with Ananya's marketing lead.",
            items: [
              { kind: "decision", title: "Enterprise tier shows talk to sales, no price", detail: "Legal was clear that no Enterprise price appears on the site.", status: "confirmed", evidence: "the Enterprise tier should not show a price at all, it should say talk to sales. Legal was clear about that." },
              { kind: "decision", title: "Growth is the highlighted pricing tier", detail: "The tier people should land on.", status: "confirmed", evidence: "the Growth tier is the one we want people to land on, so make it the highlighted card." },
              { kind: "decision", title: "Launch stays 10 November, dependent on the SOC 2 letter by 30 October", detail: null, status: "confirmed", evidence: "launch stays 10 November, dependent on the SOC 2 letter by 30 October." },
              { kind: "action", title: "Send the full list of old doc URLs with traffic", detail: "All 140 or so pages, not only the top eight, so nothing 404s after launch.", owner: "Karthik Rao", due_on: "2026-10-15", status: "done", evidence: "I can send you the full list of old doc URLs with traffic by Thursday." },
              { kind: "action", title: "Build the redirect map from the old doc URLs", detail: null, owner: "Rohan Verma", due_on: null, status: "done", evidence: "send the whole list and I'll build the redirect map from it." },
              { kind: "action", title: "Draft the pricing page copy", detail: "Needs the confirmed fee numbers first.", owner: "Priya Nair", due_on: "2026-10-17", status: "done", evidence: "The pricing page copy I will draft this week, I need the fee numbers confirmed first." },
              { kind: "action", title: "Put the confirmed fees in writing", detail: "1.9 percent Starter, 1.6 percent Growth, Enterprise negotiated.", owner: "Ananya Krishnan", due_on: "2026-10-13", status: "done", evidence: "I'll put it in writing today." },
              { kind: "question", title: "Does the blog stay on the new site or move to Medium?", owner: "Ananya Krishnan", status: "open", evidence: "Do we keep the blog on the new site or move it to Medium? Marketing is split." },
            ],
          },
          {
            id: "00000000-0000-4000-8000-0000000a0102",
            title: "Pre-launch checklist",
            held_on: "2026-10-22",
            held_time: "16:00",
            participants: ["Ananya Krishnan (Bluefin)", "Karthik Rao (Bluefin)", "Rohan Verma", "Sameer Bhatt", "Arman"],
            notes: BLUEFIN_WEB_2,
            summary: "The site launches on 10 November without the trust page, which follows once the SOC 2 letter lands, now expected 4 November. The redirect map covers 198 of 212 old URLs and the remaining 14 go to the docs home. Mobile performance is the open risk at a Lighthouse score of 71, driven by a 9 MB hero video. The contact form reaches HubSpot but lands in the wrong pipeline, and the blog decision is due Friday.",
            discussion_points: [
              "Karthik's export had 212 old URLs; 14 have no equivalent on the new site.",
              "Compliance moved the SOC 2 audit letter from 30 October to 4 November.",
              "The mobile Lighthouse score on staging is 71, with the hero video at 9 MB as the main cause.",
              "GA4 and the Bluefin product events need to share one user id.",
              "Bluefin's IT does the DNS cutover and needs 48 hours' notice.",
            ],
            follow_up_context: "Before 10 November: hero video compressed and re-measured, HubSpot pipeline fixed once Ananya names it, the event spec from Karthik, the blog decision, and the cutover runbook. The trust page waits for the SOC 2 letter.",
            carried_updates: [
              { title_includes: "redirect map", status: "done", evidence: "Rohan built the map, 198 mapped" },
              { title_includes: "pricing page copy", status: "done", evidence: "pricing page copy is live on staging, Ananya approved it on the call" },
            ],
            items: [
              { kind: "decision", title: "The 14 unmatched old URLs redirect to the docs home", detail: "With a note on the docs home that the page has moved.", status: "confirmed", evidence: "agreed - the 14 go to docs home with a note" },
              { kind: "decision", title: "Launch on 10 November without the trust page; it follows when the SOC 2 letter lands", detail: "The audit letter is now expected 4 November.", status: "confirmed", evidence: "launch stays 10 Nov, trust page follows" },
              { kind: "action", title: "Compress the hero video and re-run Lighthouse", detail: "The hero video is 9 MB and the mobile score is 71. Target 90 or above.", owner: "Sameer Bhatt", due_on: "2026-10-27", status: "in_progress", evidence: "Sameer to compress the hero video and re-run, target 90 plus", comments: [{ author: "Sameer Bhatt", body: "Down to 1.8 MB with AV1 plus a WebM fallback. Mobile score is 84 on the first run, the fonts are the next 6 points.", at: "2026-10-24T09:20:00Z" }] },
              { kind: "action", title: "Share the product event spec for GA4", detail: "So GA4 and the Bluefin product events use the same user id.", owner: "Karthik Rao", due_on: "2026-10-27", status: "todo", evidence: "Karthik to share the event spec by Monday 27th" },
              { kind: "action", title: "Fix the HubSpot pipeline mapping on the contact form", detail: "Test submissions land in the wrong pipeline.", owner: "Rohan Verma", due_on: "2026-10-29", status: "blocked", blocker: "Ananya to confirm sales or partnerships pipeline", evidence: "Rohan to fix the pipeline mapping, Ananya to confirm which pipeline (sales or partnerships)", comments: [{ author: "Rohan Verma", body: "Mapping is ready for either pipeline, it is a one-line switch once Ananya confirms.", at: "2026-10-23T14:05:00Z" }, { author: "Arman", body: "Chased Ananya on WhatsApp, she will confirm after their Monday sales sync.", at: "2026-10-24T11:40:00Z" }] },
              { kind: "action", title: "Decide where the blog lives", detail: "Marketing lead wants it on the new site, Karthik prefers Medium.", owner: "Ananya Krishnan", due_on: "2026-10-24", status: "todo", evidence: "Ananya will decide by Friday 24th" },
              { kind: "action", title: "Send the DNS cutover runbook to Bluefin IT", detail: "IT needs 48 hours' notice before the 10 November cutover.", owner: "Arman", due_on: "2026-11-03", status: "todo", evidence: "Arman to send the cutover runbook by 3 November" },
              { kind: "question", title: "Who writes the launch announcement?", owner: null, status: "open", evidence: "who writes the launch announcement? nobody owned it. left open" },
            ],
          },
        ],
      },
      {
        id: "00000000-0000-4000-8000-00000000a002",
        name: "Bluefin Pay thought leadership",
        description: "Founder-led content for Q4: two long-form pieces a month written from interviews with the CEO, and a twice-weekly LinkedIn series with a 15k monthly boost.",
        team: ["Priya Nair", "Arjun Mehta", "Arman"],
        meetings: [
          {
            id: "00000000-0000-4000-8000-0000000a0201",
            title: "Q4 content plan",
            held_on: "2026-10-15",
            held_time: "15:00",
            participants: ["Ananya Krishnan (Bluefin)", "Priya Nair", "Arjun Mehta", "Arman"],
            notes: BLUEFIN_CONTENT_1,
            summary: "Content will come from a 30-minute weekly interview with Vikram that Priya runs and writes up, since that is all the time he has. The first two long-form topics are agreed for October and November, LinkedIn goes out Tuesdays and Thursdays with a confirmed 15k monthly boost, and a podcast is parked until January. Who signs off each piece is not settled.",
            discussion_points: [
              "Vikram can give 30 minutes a week and no more, which rules out him writing drafts.",
              "Distribution runs on the company page and Vikram's own profile.",
              "A podcast was raised and parked because there is no audience to pull from yet.",
            ],
            follow_up_context: "The first interview is Wednesday 22 October. Sign-off between Ananya and Vikram needs settling before the first piece is ready.",
            items: [
              { kind: "decision", title: "Write long-form pieces from a weekly 30-minute interview with Vikram", detail: "Priya runs the call and writes from the transcript; Vikram reviews before publishing.", status: "confirmed", evidence: "agreed - interview format, Priya runs the calls" },
              { kind: "decision", title: "October and November topics: payment failures as a product problem, and onboarding 400 merchants", detail: null, status: "confirmed", evidence: "agreed on both for October and November" },
              { kind: "decision", title: "LinkedIn posts on Tuesday and Thursday mornings with a 15k monthly boost", detail: "Company page plus Vikram's profile.", status: "confirmed", evidence: "boosted with 15k a month, Ananya confirmed the budget" },
              { kind: "action", title: "Send the interview questions for the first topic", detail: null, owner: "Priya Nair", due_on: "2026-10-17", status: "done", evidence: "Priya to send the interview questions for topic one by Friday 17th" },
              { kind: "action", title: "Set up and share the LinkedIn posting calendar", detail: null, owner: "Arjun Mehta", due_on: "2026-10-20", status: "done", evidence: "Arjun to set up the LinkedIn posting calendar and share it, by Monday 20th" },
              { kind: "action", title: "Book Vikram's weekly 30-minute interview slot", detail: "First one Wednesday 22 October.", owner: "Ananya Krishnan", due_on: "2026-10-22", status: "done", evidence: "Ananya to get Vikram's 30 minute slot booked weekly, first one next Wednesday 22nd" },
              { kind: "action", title: "Draft the first long-form piece from the 22 October interview", detail: "Why payment failures are a product problem. Vikram reviews before it goes out.", owner: "Priya Nair", due_on: "2026-10-30", status: "in_progress", evidence: null, comments: [{ author: "Priya Nair", body: "Transcript is in, 2,800 words of good material. First draft Tuesday.", at: "2026-10-23T08:15:00Z" }] },
              { kind: "question", title: "Who signs off each piece before it goes out, Ananya or Vikram?", owner: "Ananya Krishnan", status: "open", evidence: "who signs off on each piece before it goes out, Ananya or Vikram? Ananya thinks Vikram will want final say. not settled" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-00000000c002",
    brand: "Juno Kids",
    name: "Farhan Sheikh",
    email: "farhan@junokids.com",
    projects: [
      {
        id: "00000000-0000-4000-8000-00000000a003",
        name: "Juno Kids festive campaign",
        description: "Diwali through New Year paid social and email, with a landing page per collection. 18 lakh across Meta and Google, reviewed every two weeks.",
        team: ["Arjun Mehta", "Kavya Iyer", "Meera Shah", "Arman"],
        meetings: [
          {
            id: "00000000-0000-4000-8000-0000000a0301",
            title: "Campaign kickoff",
            held_on: "2026-10-07",
            held_time: "12:00",
            participants: ["Farhan Sheikh (Juno)", "Ritu Agarwal (Juno)", "Arjun Mehta", "Kavya Iyer", "Meera Shah", "Arman"],
            notes: JUNO_1,
            summary: "The 18 lakh festive budget splits 70/30 between Meta and Google Shopping, reviewed every two weeks. Three collections each get a landing page off one template, the first ads go live on the 18th once Juno's shoot photos arrive, and a four-email Diwali series starts on the 20th. The Meta catalogue needs its size mapping fixed before catalogue ads run. Prepaid-only on gifting sets is open, pending Farhan seeing the numbers.",
            discussion_points: [
              "Last Diwali was 40 percent of Q4 revenue from Instagram ads and one email.",
              "Sixty percent of orders are cash on delivery and returns run at 18 percent.",
              "WhatsApp broadcasts are possible through Juno's WATI account but need opted-in numbers.",
            ],
            follow_up_context: "The 21 October review needs two weeks of data, the catalogue status, and Farhan's call on prepaid-only gifting sets.",
            items: [
              { kind: "decision", title: "Split the budget 70 percent Meta, 30 percent Google Shopping", detail: "Reviewed every two weeks.", status: "confirmed", evidence: "agreed - 70/30 Meta and Google, reviewed every two weeks" },
              { kind: "decision", title: "Four-email Diwali series, first on the 20th", detail: null, status: "confirmed", evidence: "agreed - four emails, first on the 20th" },
              { kind: "action", title: "Design one landing page template with three collection variants", detail: "Diwali ethnic, winter knits, gifting sets.", owner: "Meera Shah", due_on: "2026-10-16", status: "done", evidence: "Meera to design one template, three variants" },
              { kind: "action", title: "Send the edited shoot photos", detail: "Shoot on the 12th; the first ads need them on the 18th.", owner: "Ritu Agarwal", due_on: "2026-10-15", status: "done", evidence: "Ritu to send the edited photos by the 15th" },
              { kind: "action", title: "Fix the size mapping in the Meta catalogue feed", detail: "Sizes are wrong on about half of the 300 products.", owner: "Kavya Iyer", due_on: "2026-10-14", status: "done", evidence: "Kavya to fix the size mapping in the feed before the catalogue ads go live" },
              { kind: "action", title: "Check how many opted-in WhatsApp numbers Juno has", detail: null, owner: "Farhan Sheikh", due_on: null, status: "done", evidence: "Farhan to check how many opted-in numbers they have" },
              { kind: "question", title: "Should the gifting sets be prepaid only?", owner: "Farhan Sheikh", status: "resolved", evidence: "Arjun suggested prepaid-only on the gifting sets. Farhan is not sure, wants to see numbers. left open" },
            ],
          },
          {
            id: "00000000-0000-4000-8000-0000000a0302",
            title: "Week two performance review",
            held_on: "2026-10-21",
            held_time: "12:00",
            participants: ["Farhan Sheikh (Juno)", "Ritu Agarwal (Juno)", "Arjun Mehta", "Kavya Iyer", "Meera Shah", "Arman"],
            notes: JUNO_2,
            summary: "Two weeks in, ROAS is 2.9 against a 3.0 target, carried by Diwali ethnic at 3.8 while winter knits sit at 1.4 in a 32-degree Mumbai. Knits pause until November and their budget moves to ethnic. Gifting sets go prepaid-only with a 5 percent discount. The Meta catalogue has been in review for six days and is being escalated, ethnic returns are running at 22 percent on sizing, and the New Year shoot has no date yet.",
            discussion_points: [
              "Spend 4.1 lakh, revenue 11.8 lakh across the first two weeks.",
              "Email one: 34 percent open, 4.2 percent click, 61 orders. Email two is scheduled for the 27th.",
              "Returns on ethnic are 22 percent, mostly size, with the old size chart on the landing pages.",
              "Juno has 9,400 opted-in WhatsApp numbers, enough for a test broadcast.",
              "The New Year shoot needs to happen by 10 November for ads on the 20th.",
            ],
            follow_up_context: "The next review needs the catalogue approval, the knits restart date, the WhatsApp test result, and the photographer's dates for the New Year shoot.",
            carried_updates: [{ title_includes: "prepaid only", status: "resolved", evidence: "Prepaid only on gifting sets, with a 5 percent prepaid discount. Let's go with that." }],
            items: [
              { kind: "decision", title: "Pause winter knits until November and move the budget to Diwali ethnic", detail: "Knits at 1.4 ROAS in a 32-degree October.", status: "confirmed", evidence: "Pause knits, move the budget to ethnic, bring knits back in November." },
              { kind: "decision", title: "Gifting sets go prepaid-only with a 5 percent discount", detail: null, status: "confirmed", evidence: "Prepaid only on gifting sets, with a 5 percent prepaid discount. Let's go with that." },
              { kind: "decision", title: "Run one WhatsApp broadcast on the gifting sets as a test", detail: "To the 9,400 opted-in numbers.", status: "confirmed", evidence: "Fine, one broadcast as a test." },
              { kind: "action", title: "Update the size chart on all three landing pages", detail: "The new chart Ritu sent; returns are 22 percent, mostly size.", owner: "Meera Shah", due_on: "2026-10-21", status: "done", evidence: "I'll update the size chart on all three landing pages today, the new chart Ritu sent last week." },
              { kind: "action", title: "Escalate the Meta catalogue review through the Meta rep", detail: "In review for six days; support ticket already raised.", owner: "Arjun Mehta", due_on: "2026-10-21", status: "blocked", blocker: "Meta rep has not replied", evidence: "Yes, I'll ping the rep today and copy you.", comments: [{ author: "Arjun Mehta", body: "Rep acknowledged on the 22nd, says the review team is backed up for Diwali. No ETA.", at: "2026-10-23T06:50:00Z" }] },
              { kind: "action", title: "Switch gifting sets to prepaid-only with the 5 percent discount on Shopify", detail: null, owner: "Kavya Iyer", due_on: "2026-10-22", status: "done", evidence: "I'll do it tomorrow morning before the ads refresh." },
              { kind: "action", title: "Send the gifting sets WhatsApp test broadcast", detail: "One broadcast to the opted-in list, then review the numbers.", owner: "Kavya Iyer", due_on: "2026-10-29", status: "todo", evidence: "Let's do one broadcast on the gifting sets next week and see." },
              { kind: "action", title: "Check the photographer's dates for the New Year shoot", detail: "Shoot by 10 November for ads on the 20th. Do not book yet.", owner: "Ritu Agarwal", due_on: "2026-10-23", status: "todo", evidence: "Will check and come back by Friday." },
              { kind: "question", title: "When does the New Year creative shoot happen?", owner: "Ritu Agarwal", status: "open", evidence: "Shoot by the 10th of November if we want ads on the 20th. Nobody has booked it yet." },
            ],
          },
        ],
        board: [{ kind: "action", title: "Pull the week three numbers for Farhan before Friday", detail: "ROAS by collection, returns by size, email two results.", owner: "Arjun Mehta", due_on: "2026-10-30", status: "todo" }],
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-00000000c003",
    brand: "Serai Hotels",
    name: "Devika Menon",
    email: "devika@seraihotels.in",
    projects: [
      {
        id: "00000000-0000-4000-8000-00000000a004",
        name: "Serai Hotels direct booking site",
        description: "Move bookings off the OTAs: brand refresh, a booking page on the Cloudbeds API, and marketing pages in Hindi and English for the Goa and Jaipur properties.",
        team: ["Rohan Verma", "Meera Shah", "Sameer Bhatt", "Arman"],
        meetings: [
          {
            id: "00000000-0000-4000-8000-0000000a0401",
            title: "Discovery: booking flow and brand",
            held_on: "2026-09-29",
            held_time: "11:30",
            participants: ["Devika Menon (Serai)", "Rohan Verma", "Meera Shah", "Arman"],
            notes: SERAI_1,
            summary: "Serai wants direct bookings up from 30 to 35 percent of volume within a year, which pays for the site several times over at current OTA commissions. A hosted booking engine with a channel manager is the way, because double-bookings cost them last season, provided the site does not look like a template. Marketing pages will be in Hindi and English with the booking flow in English only. Restaurant bookings on the site are open.",
            discussion_points: [
              "Seventy percent of bookings come through Booking.com and MakeMyTrip at 18 to 22 percent commission.",
              "Bookings run on a spreadsheet and WhatsApp today, and two double-bookings happened last season.",
              "The brand should feel like the properties: white space, Jaipur blues, Goa laterite.",
              "Most guests book in English, which is why the booking flow stays English only.",
            ],
            follow_up_context: "The next call needs Rohan's shortlist of two hosted engines with pricing and demos, Meera's moodboard and two homepage directions, and Devika's photo library and rate cards.",
            items: [
              { kind: "decision", title: "Use a hosted booking engine with a channel manager", detail: "Chosen over a custom Razorpay flow because of last season's double-bookings; must not look like a template.", status: "confirmed", evidence: "Hosted it is, as long as it does not look like every other hotel site." },
              { kind: "decision", title: "Marketing pages in Hindi and English, booking flow in English only", detail: null, status: "confirmed", evidence: "So marketing in Hindi and English, booking flow in English only. Agreed." },
              { kind: "action", title: "Shortlist two hosted booking engines with pricing and demos", detail: null, owner: "Rohan Verma", due_on: "2026-10-16", status: "done", evidence: "I'll shortlist two hosted engines with pricing and a demo of each, and bring it to the next call." },
              { kind: "action", title: "Prepare a moodboard and two homepage directions", detail: null, owner: "Meera Shah", due_on: "2026-10-16", status: "done", evidence: "I'll do a moodboard and two homepage directions." },
              { kind: "action", title: "Share the photo library and rate cards", detail: null, owner: "Devika Menon", due_on: null, status: "done", evidence: "I'll get you the photo library and the rate cards." },
              { kind: "question", title: "Do restaurant bookings go on the site too?", owner: "Devika Menon", status: "open", evidence: "whether we take the restaurant bookings on the site too. The Goa restaurant is half our walk-ins." },
            ],
          },
          {
            id: "00000000-0000-4000-8000-0000000a0402",
            title: "Booking engine decision",
            held_on: "2026-10-16",
            held_time: "11:30",
            participants: ["Devika Menon (Serai)", "Rohan Verma", "Sameer Bhatt", "Arman"],
            notes: SERAI_2,
            summary: "Cloudbeds wins over Little Hotelier at 14,000 a month because its API lets the booking page stay on brand instead of an iframe widget. Devika signs the contract this week and Rohan builds the booking page for a first version by 6 November. Homepage direction B is approved, and search effort goes to two long-tail terms where the aggregators are thin. Current Jaipur rates are still outstanding and restaurant bookings are parked until the booking page is live.",
            discussion_points: [
              "Little Hotelier is 9,500 a month but its widget is iframe only; Cloudbeds is 14,000 with API access.",
              "The photo library is 600 images and Meera is picking the hero set.",
              "The Goa property ranks for nothing; the aggregators own the obvious terms.",
              "Cloudbeds does not do restaurant reservations, so that would be a separate tool.",
            ],
            follow_up_context: "Next: Cloudbeds API keys from Devika, the first booking page by 6 November, the current Jaipur rates, and the rank tracking in place. Restaurant bookings come back once the booking page is live.",
            carried_updates: [{ title_includes: "Shortlist two hosted", status: "done", evidence: "Rohan showed the two options." }, { title_includes: "moodboard", status: "done", evidence: "Devika approved direction B, the one with the full-bleed Jaipur courtyard" }],
            items: [
              { kind: "decision", title: "Go with Cloudbeds at 14,000 a month", detail: "Over Little Hotelier at 9,500: the API keeps the booking page on brand, the design matters more than the 4,500 difference.", status: "confirmed", evidence: "agreed - Cloudbeds. Devika signed off on the 14,000, the design matters more than the 4,500 difference" },
              { kind: "decision", title: "Homepage direction B, the full-bleed Jaipur courtyard", detail: null, status: "confirmed", evidence: "Devika approved direction B, the one with the full-bleed Jaipur courtyard" },
              { kind: "decision", title: "Target the long-tail search terms first: heritage stay Jaipur and Assagao villa hotel", detail: "The broad Goa terms are owned by the aggregators.", status: "confirmed", evidence: "agreed - target the two long-tail terms first" },
              { kind: "action", title: "Sign the Cloudbeds contract and share the API keys", detail: null, owner: "Devika Menon", due_on: "2026-10-23", status: "in_progress", evidence: "Devika will sign the Cloudbeds contract this week and share the API keys with Rohan", comments: [{ author: "Rohan Verma", body: "Contract is signed, keys not in my inbox yet. Asked Devika for the sandbox keys first so I can start.", at: "2026-10-24T10:10:00Z" }] },
              { kind: "action", title: "Build the booking page on the Cloudbeds API", detail: "First working version by 6 November.", owner: "Rohan Verma", due_on: "2026-11-06", status: "blocked", blocker: "Cloudbeds API keys from Devika", evidence: "Rohan to build the booking page on the Cloudbeds API, first working version by 6 November" },
              { kind: "action", title: "Send the current Jaipur rate card", detail: "The one sent is from last season.", owner: "Devika Menon", due_on: "2026-10-23", status: "todo", evidence: "Devika to send the current Jaipur rates by Thursday 23rd" },
              { kind: "action", title: "Set up Search Console and rank tracking for both properties", detail: null, owner: "Sameer Bhatt", due_on: "2026-10-20", status: "done", evidence: "Sameer to set up Search Console and the rank tracking for both properties, by Monday 20th" },
              { kind: "action", title: "Pick the hero image set from the 600-image library", detail: null, owner: "Meera Shah", due_on: "2026-10-28", status: "in_progress", evidence: "Meera is picking the hero set." },
            ],
          },
        ],
        board: [{ kind: "question", title: "Does the Hindi copy go through Devika's team or a translator we hire?", owner: "Arman", status: "open" }],
      },
    ],
  },
];
