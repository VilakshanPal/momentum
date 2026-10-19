# Decisions

Append-only. Newest at the bottom. Each entry: date, decision, why, what it rules out.

## 2026-10-20 — Plain Postgres over supabase-js
Supabase is used purely as hosted Postgres. The app talks to it with the `pg` driver and a `DATABASE_URL` (Supabase connection pooler string). No Supabase Auth, no anon key, no RLS.
Why: the demo is public with no accounts, so Supabase's auth/RLS layer buys nothing. Raw SQL for five tables is less code than a client library plus policies, and the same code runs against any Postgres.
Rules out: Supabase client in the browser, service-role key anywhere except the server env.

## 2026-10-20 — Local dev DB is embedded Postgres
`npm run db` starts a real Postgres binary (`embedded-postgres` npm package) in `.pgdata/`. Migrations in `db/migrations/*.sql` run against it with `npm run db:migrate`, and the identical files run against Supabase.
Why: no Docker or Supabase CLI on the build machine, and no Supabase project credentials yet. Development must not block on that.
Rules out: SQLite or in-memory stand-ins that would drift from production SQL.

## 2026-10-20 — One `items` table, not three
Decisions, action items and open questions share almost every column (project, originating meeting, text, owner, status, evidence). They live in one `items` table with `kind in ('decision','action','question')` and a CHECK that restricts `status` per kind.
Why: carry-forward, the project board and traceability become one query. Records stay separate rows, which is what the spec requires ("separate records so they can be filtered and tracked independently").
Rules out: nothing functionally. Revisit only if kinds grow columns that do not generalise.

## 2026-10-20 — Continuity is a query, not a copy
"Carried forward" means: unresolved items of the project whose originating meeting is older than the meeting being viewed. No link table, no duplicate rows. Supersede is `supersedes_id` on the new decision plus flipping the old one to `superseded`.

## 2026-10-20 — Draft lives on the meeting row
`meetings.draft` is JSONB holding the validated, user-edited draft until publish. Raw notes stay in `meetings.raw_notes` untouched. Publish writes `items` rows and sets `status='published'`.
Why: the spec requires preserving notes and edits across failures. One JSONB column does that without a drafts table.

## 2026-10-20 — LLM: Anthropic Claude, server-only, Zod-validated
Server action calls the Messages API with a JSON schema for the draft shape, then parses with Zod. Missing owner/date are `null`. If `ANTHROPIC_API_KEY` is absent in development, `LLM_MOCK=1` returns a deterministic draft built from the notes so the review UI can be exercised. Mock is never enabled in production.

## 2026-10-20 — Anonymous demo safety
One seeded demo project. All writes go through server actions. A "Reset demo data" action re-runs the seed. Notes are capped at 20k characters. No auth, no rate limiting until it proves necessary.

## 2026-10-20 — UI direction
Notion/ClickUp register: white surfaces, hairline borders, neutral greys, one accent, Inter, dense tables, left sidebar with project navigation, inline-editable cells. No gradients, no glassmorphism, no hero sections. Components hand-written with Tailwind; no shadcn or component kit.
