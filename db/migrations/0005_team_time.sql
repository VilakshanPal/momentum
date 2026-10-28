-- Project team (names offered in the participants picker) and an optional meeting time.
alter table projects add column team jsonb not null default '[]'::jsonb;
alter table meetings add column held_time time;
