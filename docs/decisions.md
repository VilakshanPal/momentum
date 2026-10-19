# Decisions

Append-only. Newest at the bottom. Each entry: date, decision, why, what it rules out.

## 2026-10-20 · Plain Postgres over supabase-js
Supabase is used purely as hosted Postgres. The app talks to it with the `pg` driver and a `DATABASE_URL` (Supabase connection pooler string). No Supabase Auth, no anon key, no RLS.
Why: the demo is public with no accounts, so Supabase's auth/RLS layer buys nothing. Raw SQL for five tables is less code than a client library plus policies, and the same code runs against any Postgres.
Rules out: Supabase client in the browser, service-role key anywhere except the server env.

## 2026-10-20 · Local dev DB is embedded Postgres
`npm run db` starts a real Postgres binary (`embedded-postgres` npm package) in `.pgdata/`. Migrations in `db/migrations/*.sql` run against it with `npm run db:migrate`, and the identical files run against Supabase.
Why: no Docker or Supabase CLI on the build machine, and no Supabase project credentials yet. Development must not block on that.
Rules out: SQLite or in-memory stand-ins that would drift from production SQL.

## 2026-10-20 · One `items` table, not three
Decisions, action items and open questions share almost every column (project, originating meeting, text, owner, status, evidence). They live in one `items` table with `kind in ('decision','action','question')` and a CHECK that restricts `status` per kind.
Why: carry-forward, the project board and traceability become one query. Records stay separate rows, which is what the spec requires ("separate records so they can be filtered and tracked independently").
Rules out: nothing functionally. Revisit only if kinds grow columns that do not generalise.

## 2026-10-20 · Continuity is a query, not a copy
"Carried forward" means: unresolved items of the project whose originating meeting is older than the meeting being viewed. No link table, no duplicate rows. Supersede is `supersedes_id` on the new decision plus flipping the old one to `superseded`.

## 2026-10-20 · Draft lives on the meeting row
`meetings.draft` is JSONB holding the validated, user-edited draft until publish. Raw notes stay in `meetings.raw_notes` untouched. Publish writes `items` rows and sets `status='published'`.
Why: the spec requires preserving notes and edits across failures. One JSONB column does that without a drafts table.

## 2026-10-20 · LLM: Anthropic Claude, server-only, Zod-validated
Server action calls the Messages API with a JSON schema for the draft shape, then parses with Zod. Missing owner/date are `null`. If `ANTHROPIC_API_KEY` is absent in development, `LLM_MOCK=1` returns a deterministic draft built from the notes so the review UI can be exercised. Mock is never enabled in production.

## 2026-10-20 · Anonymous demo safety
One seeded demo project. All writes go through server actions. A "Reset demo data" action re-runs the seed. Notes are capped at 20k characters. No auth, no rate limiting until it proves necessary.

## 2026-10-20 · UI direction
Notion/ClickUp register: white surfaces, hairline borders, neutral greys, one accent, Inter, dense tables, left sidebar with project navigation, inline-editable cells. No gradients, no glassmorphism, no hero sections. Components hand-written with Tailwind; no shadcn or component kit.

## 2026-10-20 · Fixed demo IDs
The seeded project and its two meetings use constant UUIDs (`DEMO_PROJECT_ID` in `src/lib/seed.ts`). A reset wipes and re-inserts the same IDs.
Why: the submission link and the demo video point at `/p/<id>`. A reset must not break them.

## 2026-10-20 · cacheComponents off
Next 16 scaffolds with `cacheComponents: true`, which requires Suspense boundaries around every dynamic read. Every page here reads the DB per request, so classic dynamic rendering is simpler. Turned off in `next.config.ts`.

## 2026-10-20 · No refusal fallbacks on the LLM call
`messages.parse` is used without the server-side `fallbacks` parameter. Meeting notes are low-risk content; a refusal surfaces as an error with retry. Revisit if a refusal is ever seen in testing.

## 2026-10-20: UI rebuilt to a Notion/ClickUp register
First pass was rejected as generic. Rebuilt with: lucide icons throughout, initials avatars with stable colours, Linear-style status icons with a custom dropdown (no native selects), a 48px top bar with breadcrumbs on every page, a sidebar with nested project navigation and counts, a status-grouped board, a timeline decision log, a Notion-style properties block on published meetings, and a two-pane editor with a sticky notes pane. No component kit; everything is Tailwind.

## 2026-10-20: Draft carries participants
The model returns `participants` (names the notes identify as attendees). If the meeting has none set, generation fills them. Saves the user typing what the transcript already says.

## 2026-10-20: Blocker and status are coupled on actions
Moving an action out of "blocked" clears its blocker text; typing a blocker on a to-do marks it blocked. Carried-forward updates follow the same rule. Avoids rows that say "in progress" with a stale "waiting on" note.

## 2026-10-20: Shared constants live in server-safe modules
A plain string exported from a "use client" file arrives in a server component as a client reference, not a string (the board header lost its grid this way). Non-component constants go in `ui.tsx` or `lib/`.

## 2026-10-20: No em dashes anywhere
User rule. UI copy, seed data, prompts, docs, commit messages. Grep for the character before committing.
