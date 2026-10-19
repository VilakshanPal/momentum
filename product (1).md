# MOMentum --- Product Build Spec

**Status:** Active MVP spec\
**Last updated:** 19 October 2026\
**Hackathon:** No Hands: The Wispr Challenge --- Builders track\
**Deadline:** 30 October 2026, 11:59 pm IST\
**Product:** MOMentum\
**Tagline:** Turn meetings into work that actually gets done.

## Product in one minute

MOMentum is a lightweight meeting-to-execution workspace for agency
teams coordinating clients, designers, media buyers, CRM specialists,
and developers. It turns rough meeting notes into reviewed Minutes of
Meeting (MOM), decisions, action items, blockers, open questions, and
follow-up drafts. Its differentiator is **project-level continuity**:
unresolved work and decision history remain connected across meetings
instead of disappearing into separate documents.

**Core loop:** Rough notes or pasted transcript → AI-generated draft →
human review/edit → publish → persistent decisions and actions → carry
unresolved work into the next meeting → draft follow-up.

The primary input is rough notes. Notes copied from a tool such as
Fireflies must work as ordinary pasted text from day one. MOMentum is
not a live recorder or transcription engine. Use Wispr Flow to dictate
development instructions into Claude Code; do not treat Wispr as an
in-product transcription service.

**Stack direction:** Next.js App Router, TypeScript, Tailwind, Supabase
Postgres, and a server-side LLM API with structured-output support. Use
Zod (or equivalent) to validate inputs and model output. Keep provider
keys and Supabase service-role credentials server-side.

**Public demo constraint:** Judges must be able to open and try the
deployed app without creating an account. Provide synthetic seeded data
with at least two connected meetings. Never expose confidential client
or customer data.

## Priority order

Build in the order below. Finish and test each priority before moving to
the next. Inspect the repository first and reuse working code; do not
rebuild what already works. Prefer one reliable end-to-end vertical
slice over isolated screens or premature integrations.

# 1. P0s --- Build these first

P0s are the foundation and the first end-to-end slice. Do not start
external integrations until these work.

### P0.1 --- Inspect and establish the project

-   Inspect the repository, current implementation, scripts, and
    environment setup before editing.
-   Confirm the existing framework and dependencies; preserve working
    code.
-   Establish or verify the Next.js + TypeScript app, environment
    variable handling, and deployment path.
-   Configure Supabase and commit database migrations. Add a safe
    `.env.example` with placeholder values only.
-   Deploy a minimal app early so public access and environment
    configuration are tested well before submission.

### P0.2 --- Minimal data model and realistic seed data

Use the smallest relational model that supports the core loop:

-   `projects`: name, optional description/client, timestamps.
-   `meetings`: project ID, title, date, participants, raw notes,
    structured MOM content, draft/published status, timestamps.
-   `decisions`: project ID, originating meeting ID, description,
    proposed/confirmed/superseded status, optional evidence, optional
    `supersedes_id`.
-   `action_items`: project ID, originating meeting ID,
    title/description, nullable owner and due date,
    todo/in_progress/done/blocked status, optional blocker/dependency,
    optional evidence.
-   `open_questions`: project ID, originating meeting ID, question,
    nullable owner, open/resolved status, optional evidence.

Use UUIDs, foreign keys, timestamps, sensible indexes, and
non-destructive history-preserving behavior. Participants can be JSON
initially; do not add tables unless the implemented workflow needs them.
A carried-forward action or question remains the same record, not a
duplicate.

Seed a synthetic agency project (for example, "HAIRO --- Website
Redesign") with at least two connected meetings. The seed must show a
decision, an unresolved action, a blocked/dependent task, and an open
question.

### P0.3 --- Rough notes to validated AI draft

-   Let a user create a project and a meeting, then enter or paste rough
    notes/transcript text.
-   Generate a structured draft containing: summary, discussion points,
    decisions, action items, blockers/dependencies, open questions, and
    follow-up context.
-   Call the LLM only from the server. Validate the response before
    rendering it.
-   Preserve the original notes if generation fails; show an
    understandable error and allow retry.
-   Never invent a person, owner, deadline, approval, decision, or
    commitment. Missing owners/dates must be `null`. Separate confirmed
    decisions from proposals, questions, and discussion points.
-   Include concise evidence/source excerpts for extracted decisions and
    actions where practical, so the user can verify why an item was
    generated.

### P0.4 --- Review before persistence

-   Display the generated MOM in an editable review state.
-   Allow users to edit, confirm, reject, or remove extracted items.
-   Do not create confirmed project records merely because the model
    returned them.
-   Publish only after user review. Make draft/published state and save
    status clear.
-   Keep TypeScript types, validation schema, database fields, and UI
    contracts aligned.

**P0 exit criterion:** A user can open the app, open the seeded project,
enter rough notes, generate a valid draft, and review/edit it without
losing their input.

# 2. Must-haves --- Complete the MVP

These are required for the product to be considered complete. Build them
after P0s and before integrations.

### 2.1 --- Projects and meeting history

-   Create/list projects and open a project overview.
-   Create meetings inside a project and save title, date, participants,
    and raw notes.
-   List and reopen a project's previous meetings.
-   Make the originating meeting visible from each decision and action.

### 2.2 --- Publish and persist the reviewed record

-   On publish, persist the meeting and its approved decisions, action
    items, and open questions.
-   Validate relationships and allowed statuses on the server.
-   Do not show success until the write succeeds. If saving fails,
    preserve the draft and let the user retry.
-   Keep decisions and actions as separate records so they can be
    filtered and tracked independently.

### 2.3 --- Action tracking

-   Show project actions in a simple list/table with title, owner, due
    date, status, blocker, and originating meeting.
-   Let users edit title/description, set or clear owner/date, and
    update status.
-   Supported statuses: `todo`, `in_progress`, `done`, `blocked`.
-   AI must not mark a task complete based only on meeting notes; status
    changes after publishing are user-controlled.
-   Missing owners and deadlines remain visibly unassigned/unscheduled.

### 2.4 --- Cross-meeting continuity and decision history

-   Show unresolved actions and open questions when a later meeting is
    prepared or opened.
-   Carry forward the same persistent records; do not create duplicate
    tasks just because they appear in another meeting's context.
-   Show decision history. If a later decision supersedes an earlier
    one, mark the earlier record as superseded instead of deleting or
    overwriting it.
-   Preserve links to the originating meeting and make
    blockers/dependencies understandable.
-   Do not implement advanced semantic conflict detection yet;
    preserving and displaying history is sufficient.

### 2.5 --- Open questions and follow-up draft

-   Keep open questions separate from decisions and action items; allow
    marking them open/resolved and optionally assigning an owner.
-   Generate an editable follow-up message from reviewed/confirmed
    meeting content.
-   Include decisions, actions, owners, known deadlines, and outstanding
    confirmations where relevant.
-   Provide copy-to-clipboard. Do not send email, Slack, WhatsApp, or
    other messages automatically.

### 2.6 --- Public demo and reliability

-   No account creation should be required to try the judge-facing
    workflow.
-   Seeded sample data must make the product's value obvious immediately
    and demonstrate continuity across at least two meetings.
-   Use synthetic or permission-cleared data only.
-   Provide loading, empty, and error states for AI generation and
    database operations.
-   Test in a fresh/incognito browser session, not only in the
    developer's existing session.
-   Keep private records protected. If anonymous editing is enabled,
    isolate it to a demo workspace/session and protect mutations
    appropriately. Never expose the Supabase service-role key in the
    browser.

**Must-have exit criterion:** The complete loop works: rough notes →
reviewed MOM → persisted decisions/actions/questions → status updates →
unresolved work carried into another meeting → follow-up draft.

# 3. Should-haves --- Add only after the core loop is stable

These improve the real workflow but must not delay P0s or must-haves.
Implement at most one external integration initially.

### 3.1 --- ClickUp one-way task export (preferred first integration)

Allow the user to select reviewed action items and export them to a
chosen ClickUp List. Only export actions that the user explicitly
selects; do not export the entire meeting automatically.

-   Send task title and description, and owner/due date only when
    available and correctly mapped.
-   Do not invent missing assignees or dates.
-   Store the provider, internal action ID, external task ID, external
    task URL, export status, and creation timestamp so the user can
    reopen the task and avoid accidental duplicate exports.
-   Handle errors visibly and make retry safe/idempotent.
-   Keep this **one-way** for the MVP: MOMentum creates a ClickUp task
    and stores its link. Do not build bidirectional status sync.
-   Use a personal token only for local experimentation if appropriate.
    A product intended for other users should use ClickUp OAuth. Do not
    hard-code or expose credentials. If a real connection cannot be
    configured reliably for the demo, clearly label it as unavailable
    rather than pretending an export occurred.

### 3.2 --- Fireflies transcript import (after ClickUp or if clearly quicker)

The first supported Fireflies workflow is **copy/paste transcript or
meeting notes into the normal meeting input**; this is already covered
by P0 and must work without an integration.

If time remains, add direct Fireflies import through its API or
webhook: - Let the user choose/import a meeting transcript or summary. -
Map the imported content into a MOMentum meeting draft; run the same
validation and human-review process as pasted notes. - Store the
provider and source meeting ID when available to prevent duplicate
imports. - Keep Fireflies import separate from publishing: importing or
summarizing must not automatically create confirmed actions/decisions.

Do not spend early build time on Fireflies OAuth/API setup before the
core workflow is complete.

### 3.3 --- Lightweight export and usability polish

If core functionality and one integration are stable: - Export/copy the
MOM as Markdown or plain text. - Add basic project/meeting search only
if it materially helps the demo. - Improve keyboard flow, empty states,
loading feedback, and visual hierarchy. - Measure manual MOM preparation
time versus AI-assisted review time before making time-saving claims.

# 4. Would-haves --- Defer beyond the MVP unless everything above is done

-   Jira task export using the same selective, one-way export pattern as
    ClickUp.
-   Bidirectional ClickUp/Jira status synchronization.
-   Advanced conflict detection across historical decisions.
-   Live audio recording, speech-to-text, Zoom/Google Meet integrations,
    calendar sync.
-   Automatic email/Slack/WhatsApp sending.
-   Real-time collaboration, complex permissions, multi-tenant
    organization administration.
-   Full project-management features, analytics dashboards, vector
    search/RAG, agent framework, autonomous task assignment or
    completion.
-   Advanced search, templates, PDF export, or other polish that does
    not strengthen the core loop.

# Product rules that must never be broken

1.  **Human approval is required:** AI output stays a draft until
    reviewed and published.
2.  **No fabricated commitments:** Never invent decisions, approvals,
    owners, dates, or task completion.
3.  **Preserve source material:** Keep raw notes and user edits when AI
    generation or saving fails.
4.  **Preserve history:** Superseded decisions remain visible; do not
    silently overwrite them.
5.  **No duplicate carry-forward:** Unresolved actions/questions keep
    their existing identity across meetings.
6.  **Traceability:** Decisions and actions link to the meeting where
    they originated.
7.  **Safe integrations:** Export only selected, approved actions; store
    external IDs/URLs; report errors honestly; never claim an export
    succeeded unless the provider confirms it.
8.  **Secrets stay server-side:** Never expose LLM keys or Supabase
    service-role credentials.
9.  **Scope discipline:** Do not start should-haves or would-haves until
    all P0s and must-haves work and have been tested.

# Implementation instructions for Claude Code

At the start of each work session:

1.  Inspect the repository and report what is already implemented versus
    missing.
2.  Choose the **next incomplete item in priority order**. Do not jump
    to integrations or visual polish while a higher-priority item is
    incomplete.
3.  Propose a small implementation plan and call out any consequential
    schema/API decision before changing it.
4.  Implement a complete vertical slice, run relevant checks, and test
    the real user flow.
5.  Report what changed, what was tested, any known limitation, and the
    next priority item.

Do not rewrite the whole application without first checking its current
state. Keep implementation pragmatic for a solo hackathon project with a
30 October 2026 deadline.

## Demo story

Use the synthetic agency redesign project: 1. Open the seeded project
and show prior meeting history. 2. Paste rough notes or a transcript and
generate the draft. 3. Review/edit actions and show missing dates remain
blank. 4. Publish and show actions on the project board. 5. Open the
next meeting and show unresolved work carried forward without
duplicates. 6. Generate/copy a follow-up draft. 7. If a real integration
is implemented and tested, export one approved action to ClickUp and
open the returned task link. Do not make the integration the centerpiece
if it is not reliable.

## Definition of done

MOMentum is ready for submission when the public demo opens without
signup and reliably demonstrates the must-have loop, including editable
AI output, persisted decisions/actions, cross-meeting continuity,
preserved history, and a follow-up draft. The ClickUp and Fireflies API
integrations are optional relative to that loop; pasted Fireflies
content is supported through the normal input field.
