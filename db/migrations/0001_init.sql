-- MOMentum core schema. Postgres 15+. Same file runs on local embedded PG and Supabase.

create table projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client      text,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table meetings (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  title         text not null,
  held_on       date not null,
  participants  jsonb not null default '[]'::jsonb,
  raw_notes     text not null default '',
  -- Structured Minutes of Meeting. Draft until status = 'published'. Never overwritten on failure.
  mom           jsonb,
  status        text not null default 'draft' check (status in ('draft','published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index meetings_project_idx on meetings (project_id, held_on desc);

-- Decisions, action items and open questions. One row = one persistent record.
-- Carry-forward never copies rows; it queries unresolved items from earlier meetings.
create table items (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  meeting_id    uuid not null references meetings(id) on delete cascade, -- originating meeting
  kind          text not null check (kind in ('decision','action','question')),
  title         text not null,
  detail        text,
  owner         text,            -- null = unassigned, never invented
  due_on        date,            -- null = unscheduled, never invented
  status        text not null,
  blocker       text,            -- actions only: what this depends on
  evidence      text,            -- source excerpt from the notes
  supersedes_id uuid references items(id),
  position      int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint items_status_by_kind check (
    (kind = 'decision' and status in ('proposed','confirmed','superseded')) or
    (kind = 'action'   and status in ('todo','in_progress','done','blocked')) or
    (kind = 'question' and status in ('open','resolved'))
  )
);
create index items_project_idx on items (project_id, kind, status);
create index items_meeting_idx on items (meeting_id);
