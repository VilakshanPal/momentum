# MOMentum

Turn meetings into work that actually gets done. Rough notes in, reviewed Minutes of Meeting out, with decisions, actions and open questions that carry across meetings instead of dying in separate documents.

Built solo for **No Hands: The Wispr Challenge** (Builders track), dictated with Wispr Flow into Claude Code.

## Run locally

```bash
npm install
npm run db          # starts an embedded Postgres on :5433 (first run downloads it)
npm run db:migrate  # applies db/migrations/*.sql
npm run db:seed     # loads the synthetic HAIRO project with two meetings
npm run dev         # http://localhost:3000
```

Copy `.env.example` to `.env`. Without `OPENAI_API_KEY`, set `LLM_MOCK=1` to exercise the UI with a deterministic fake draft.

## Deploy (Vercel + Supabase)

1. Create a Supabase project. Run `db/migrations/0001_init.sql` in the SQL editor (or set `DATABASE_URL` and run `npm run db:migrate`).
2. Seed it: `DATABASE_URL=<supabase session pooler url> npm run db:seed`.
3. On Vercel set `DATABASE_URL`, `OPENAI_API_KEY`, and `CRON_SECRET` (any long random string). The daily cron in `vercel.json` re-seeds the demo.

No sign-in. Everything is server actions against Postgres; no credentials reach the browser.

## Docs

- `docs/plot.md` · where the build is and what is next.
- `docs/decisions.md` · every consequential decision and why.
- `product (1).md` · the product spec.
