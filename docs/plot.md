# Plot · where the build is and where it is going

Updated at the end of every work block. Read this first.

## Status board

| # | Task | State |
|---|------|-------|
| 1 | Scaffold Next.js 16 + Tailwind 4, docs folder, .env.example | done |
| 2 | Local embedded Postgres, `pg` pool, migration runner | done |
| 3 | Schema migration: projects, meetings, items | done |
| 4 | Seed: HAIRO Website Redesign, two connected meetings, sample notes for a third | done |
| 5 | App shell: sidebar, project header with tabs, meetings list, open-work rail | done |
| 6 | Project board: actions + questions tables with inline status/owner/date/blocker edits | done |
| 7 | New meeting: notes → server-side generate (OpenAI Responses API, Zod-validated) → draft | done, verified with the real model |
| 8 | Review screen: notes left, draft right with evidence; edit/remove/toggle; supersede; publish | done |
| 9 | Carried-forward panel on every meeting, same records; AI-suggested status updates, user-ticked | done |
| 10 | Decision log with supersede links; superseded rows preserved | done |
| 11 | Follow-up draft + copy; MOM Markdown copy | done |
| 12 | Loading/empty/error states, 20k note cap, demo reset button + daily cron | done |
| 13 | `next build` clean; walkthrough of demo story in browser | done (dev session, not incognito yet) |
| 14 | Deploy to Vercel + Supabase | blocked: credentials |
| 15 | Real-LLM test of generation + follow-up on the seeded sample notes; tune prompt | done: 8.6s draft, 4.7s follow-up at low reasoning effort |
| 16 | UI rebuilt: icons, avatars, status menus, grouped board, timeline log, top bars, sticky notes pane | done |
| 16b | Mock LLM with golden drafts for the sample notes and a Fireflies-style transcript; both flows walked in Chrome | done |
| 17 | Fresh/incognito walkthrough on the deployed URL | todo (after 14) |
| 18 | ClickUp one-way export | decide 27 Oct |

## Timeline (deadline Fri 30 Oct 2026, 11:59 pm IST)
- 20 Oct: tasks 1–13 ✔
- 21 Oct: 14, 15 as soon as keys arrive; 16
- 22–24 Oct: prompt tuning on real notes, polish, 17
- 25–26 Oct: week-1 check-in post, buffer
- 27 Oct: go/no-go on ClickUp export
- 29 Oct: video, About text, usage card, submit. 30 Oct is buffer.

## Needs from Arman
- Supabase project: `DATABASE_URL` (Session pooler string) for Vercel env and for seeding.
- `OPENAI_API_KEY` is set locally and real generation is verified. Still needed on Vercel. Model defaults to gpt-5.5, override with `OPENAI_MODEL`; reasoning effort defaults to low, override with `OPENAI_REASONING`.
- Vercel project connected to this repo (or run `vercel` once locally). Set `CRON_SECRET` too.
- Optional: a real set of rough notes from an actual meeting, to tune the prompt and to show "one real result" in the submission.

## How to run
See README.md. `npm run db` → `npm run db:migrate` → `npm run db:seed` → `npm run dev`.

## Log
- 2026-10-20 23:30: Design pass 1 on the installed skills: DESIGN.md tokens applied everywhere, motion rules from emil-design-eng, Base UI status menu, Playwright screenshot scripts. Reviewed all seven screens; fixed clipped notes pane, decision detail layout, avatar stacks. Awaiting approval before pass 2 (break-ui worst-case data, remaining composition polish).
- 2026-10-20 04:30: Provider switched to OpenAI (user has OpenAI keys only). Real generation tested on the sample notes: accurate, evidence on every item, participants picked up, relative dates resolved correctly. First run took 47s at default reasoning; low effort brings it to under 10s. Prompt tightened: 3 to 6 discussion points, only real status changes in carried updates, never backwards. Cross-kind statuses coerced server-side.
- 2026-10-20 03:30: UI rebuilt after feedback (generic look rejected). Tested sample-notes flow and pasted-transcript flow end to end with the mock, including participants auto-fill, carried-forward updates, publish, board, decisions. Em dashes removed everywhere. Production build clean.
- 2026-10-20 00:30: Plan accepted. Build started. Decisions 1–8 recorded.
- 2026-10-20 01:45: Demo IDs pinned, reset verified in browser, polish commit.
- 2026-10-20 01:30: Core loop built and walked through in Chrome with the mock LLM: new meeting → sample notes → draft → tick carried update → publish → board shows live records, carried item marked done, follow-up drafted, Markdown copy. Production build clean. First commit.
