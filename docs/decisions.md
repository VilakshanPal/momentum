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

## 2026-10-20: LLM provider is OpenAI, not Anthropic
User has OpenAI API access only. `src/lib/llm.ts` now uses the OpenAI Responses API with `zodTextFormat` structured output against the same `MomSchema`; follow-up uses `responses.create` and `output_text`. Model defaults to `gpt-5.5`, overridable with `OPENAI_MODEL`. Validation, mock fallback and error handling are unchanged.

## 2026-10-20: Design system source of truth is DESIGN.md
`npx getdesign@latest add notion` installed `DESIGN.md` (an independent analysis of Notion's language). All colour, type, radius, spacing and elevation tokens in `globals.css` now derive from it: warm canvas #f6f5f4, white surfaces with #e6e6e6 hairlines, near-black Inter with negative tracking on headings, a single blue (#0075de) for actions and the active indicator, the sticker palette for status and avatars only, layered micro-shadows instead of drop shadows.

## 2026-10-20: Motion rules from emil-design-eng
`npx skills add emilkowalski/skill` installed the skills under `.agents/skills` (symlinked into `.claude/skills`). Applied: press feedback `scale(0.97)` on every button, strong `--ease-out` curve, all UI transitions under 250ms, popovers scale from their trigger, hover styles gated behind `(hover: hover)`, `prefers-reduced-motion` strips movement, draft sections stagger 40ms after generation. The status dropdown moved to Base UI (`@base-ui/react`) per `pick-ui-library`: focus management, keyboard navigation and dismissal without hand-rolling.

## 2026-10-20: Screenshots via Playwright on the installed Chrome
The Claude browser extension stopped reaching localhost mid-session. `scripts/shots.mjs` and `scripts/walk.mjs` drive the installed Chrome through Playwright (`channel: "chrome"`, no browser download) and write to `.shots/` (gitignored). Used for every design review pass.

## 2026-10-20: Approval is a checkbox, not a delete
Every AI suggestion on the review screen (decision, action, question) has a checkbox. Ticked = will be published; unticked = stays visible, dimmed, stored in the draft as `skipped: true`, never becomes a record. The Publish button counts what is ticked ("Publish 7 items"). The hover X still deletes outright.
Why: the spec's P0.4 asks for confirm, reject or remove. A hover-only X is not a visible reject, and a rejected suggestion should stay in the draft so the reviewer can change their mind and so the record shows what the model proposed.

## 2026-10-20: After publish, say what happened and what is next
A published meeting opened within three minutes of publishing shows one line: how many actions and questions went to the board, decisions to the log, carried items updated, and "Next: draft the follow-up". The flag comes from SQL (`published_at > now() - interval '3 minutes'`), not `Date.now()` in render, which React's purity lint rejects.

## 2026-10-20: Action detail is shown and editable after publish
`detail` on actions was captured but never rendered once published. It now shows under the title in the open-work rail and the published view, and is editable inline on the board (spec 2.3 "edit title/description"). In the draft it is editable whenever the model returned one.

## 2026-10-20: Local Postgres must be UTF8
Windows initdb defaults to the system codepage (WIN1252), which rejects "Nguyễn" and "李". `scripts/db.ts` now passes `--encoding=UTF8 --locale=C`; Supabase is UTF8 already. Existing `.pgdata` had to be deleted and re-initialised. Found by the worst-case seed.

## 2026-10-20: Worst-case fixture lives in the database, not in props
`scripts/seed-worst.ts` adds a second project with the longest values the schema accepts (300-char titles, 80-char owners, emails as owners, 500-char blockers, 30 participants, emoji and CJK names, one-letter names, 1,200 actions, an empty meeting, a one-of-everything meeting). It enters through the same boundary as real data. A demo reset removes it. Found and fixed: broken emoji initials, clipped origin links, wrapped date cells hiding the owner, overflowing "Replaces" chips, decision-log dates wrapping to three lines, blank rows for untitled meetings, a full-width supersede select. The board scrolls sideways under 960px rather than crushing the title column.

## 2026-10-20: Ctrl+Enter generates
Keyboard path from notes to draft, shown next to the notes. Nothing animates on it (keyboard actions get no motion).

## 2026-10-21: One click from the project page to a generated draft
"Try it with sample notes" on the project page creates a meeting, opens the editor, types the sample notes in over about a second with a "Demo: typing sample notes" chip, then generates. "Use sample notes" inside the editor does the same typing and generation. Reduced motion skips the typing.
Why: judges will spend about ninety seconds on the link. The old path was four decisions (New meeting, title, Use sample notes, Generate) before anything happened. The typing makes it obvious the notes are being supplied for demonstration, not pulled from somewhere. The demo flag is a query parameter the editor strips on load, so a refresh does not retype; it is ignored once the meeting has notes or a draft.

## 2026-10-21: One shared daily cap on model calls
`llm_usage` has one row per day. Every draft or follow-up generation increments it first and is refused past `DAILY_GENERATION_CAP` (default 300) with a message that names the hackathon demo and the UTC reset. Browsing, editing and publishing never touch the model, so they keep working.
Why: the public link has no sign-in, so there is no per-person identity to rate-limit on. One global cap bounds the OpenAI bill to a few dollars a day in the worst case. Counting before calling means a refused call is still counted; simpler than a transaction and errs on the safe side.

## 2026-10-21: Reset is two clicks and labelled as a demo control
The sidebar says "Hackathon demo" and that the reset is not part of the product. The button turns into an inline confirm that says it resets the shared workspace for everyone on the link. Inline, not a browser dialog, matching the New meeting form.
Why: one judge resetting mid-way through another judge's review was the most likely way the demo breaks for someone. Arman also wanted judges to know the reset exists only to make testing easy.

## 2026-10-21: Icon and link preview are files, rendered from the app
`src/app/icon.svg`, `apple-icon.png` and `opengraph-image.png` use the Next file conventions, so no manual head tags. `scripts/og.mjs` renders the preview card from a live screenshot of the published meeting view, so it stays true to the product when the UI changes. Metadata base is derived by Next on Vercel; `NEXT_PUBLIC_SITE_URL` covers other hosts.
