# Plot — where the build is and where it is going

Updated at the end of every work block. Read this first.

## Status board

| # | Task | State |
|---|------|-------|
| 1 | Scaffold Next.js + Tailwind, docs folder, .env.example | in progress |
| 2 | Local embedded Postgres, `pg` pool, migration runner | todo |
| 3 | Schema migration: projects, meetings, items | todo |
| 4 | Seed: HAIRO Website Redesign, two connected meetings | todo |
| 5 | App shell: sidebar, project overview, meeting list | todo |
| 6 | Project board: items table with inline status/owner/date edits | todo |
| 7 | New meeting: notes → server-side generate → validated draft | todo |
| 8 | Review screen: notes left, items right with evidence; edit/remove; publish | todo |
| 9 | Carry-forward panel on a meeting: unresolved items from earlier meetings | todo |
| 10 | Decision supersede + decision history view | todo |
| 11 | Follow-up draft + copy; MOM Markdown copy | todo |
| 12 | Loading/empty/error states, demo reset, 20k note cap | todo |
| 13 | `npm run build` clean, fresh-browser walkthrough of demo story | todo |
| 14 | Deploy to Vercel + Supabase (needs user credentials) | blocked: credentials |

## Timeline (deadline Fri 30 Oct 2026, 11:59 pm IST)
- 20 Oct: tasks 1–6
- 21–22 Oct: tasks 7–8 (P0 exit criterion)
- 23–24 Oct: tasks 9–11 (must-have exit criterion)
- 25–26 Oct: task 12–13, week-1 check-in post
- 27 Oct: go/no-go on ClickUp export
- 29 Oct: video, About text, usage card, submit. 30 Oct is buffer.

## Needs from Arman
- Supabase project: `DATABASE_URL` (Session pooler string) for Vercel env.
- `ANTHROPIC_API_KEY` for Vercel env and for local testing of real generation.
- Vercel account connected to the repo (or run `vercel` once locally).

## Log
- 2026-10-20: Plan accepted. Build started. Decisions 1–8 recorded in decisions.md.
