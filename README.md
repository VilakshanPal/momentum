# MOMentum

Turn meetings into work that actually gets done. Rough notes in, reviewed Minutes of Meeting out, with decisions, actions and open questions that carry across meetings instead of dying in separate documents.

Built solo for **No Hands: The Wispr Challenge** (Builders track), dictated with Wispr Flow into Claude Code.

## Run locally

```bash
npm install
npm run db          # starts an embedded Postgres on :5433 (first run downloads it)
npm run db:migrate  # applies db/migrations/*.sql
npm run db:seed     # loads the synthetic Aarohi Ceramics project with two published meetings
npm run dev         # http://localhost:3000
```

Copy `.env.example` to `.env`. Without `OPENAI_API_KEY`, set `LLM_MOCK=1` to exercise the UI with a deterministic fake draft.

**Testing without spending credits:** open any page with `?dev=yes` (for example `http://localhost:3000/?dev=yes`, or the live link). That browser then gets predefined AI output and a "Mock AI" badge in the sidebar until you open a page with `?dev=no`. Works on the deployed site too.

## Deploy (Vercel + Supabase)

1. Create a Supabase project. Run `db/migrations/0001_init.sql` in the SQL editor (or set `DATABASE_URL` and run `npm run db:migrate`).
2. Seed it: `DATABASE_URL=<supabase session pooler url> npm run db:seed`.
3. On Vercel set `DATABASE_URL` and `OPENAI_API_KEY`. The demo data only resets when someone clicks Reset demo data; nothing resets it on a schedule. Optional: `DAILY_GENERATION_CAP` (default 300 model calls a day across the whole link).

No sign-in. Everything is server actions against Postgres; no credentials reach the browser.

## Design review tooling (dev only)

- `npm run prompt:check` runs the assertions behind the generation prompt's after-the-model checks (verbatim evidence, duplicates, carried items).
- `node scripts/prompt-eval.mjs [--real] [notes.txt ...]` runs the sample call and any transcript files through generation on the review stack (:3001, momentum_test) and prints the drafts. Mock by default; `--real` spends one OpenAI generation per input.

Playwright drives the installed Chrome; nothing is downloaded.

```bash
node scripts/shots.mjs .shots                       # every screen of the demo project
node scripts/walk.mjs .shots/walk --generate        # new meeting, sample notes, generate, untick one, publish, board
node scripts/demo-walk.mjs                          # one-click demo: Try it with sample notes, typing, generated draft
node scripts/long-notes.mjs                         # 19k-char transcript on the mock; add --real to time the real model (spends credits)
node scripts/og.mjs                                 # re-renders src/app/opengraph-image.png and apple-icon.png from the live app
npx tsx scripts/seed-worst.ts                       # adds a worst-case project (long names, 1,200 actions, emoji, CJK)
node scripts/shots.mjs .shots/worst --project 00000000-0000-4000-8000-000000000002 --width 1024
npx tsx scripts/seed-worst.ts --remove
```

## Docs

- `docs/plot.md` · where the build is and what is next.
- `docs/decisions.md` · every consequential decision and why.
- `product (1).md` · the product spec.
- `src/lib/samples.ts` · the sample story: ten weekly calls on one Shopify build, kickoff to handover. Calls 1 and 2 are seeded as history; each click of "Try it with sample notes" generates the next one.
