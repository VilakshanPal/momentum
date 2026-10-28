-- Company-level clients: a managed list, so one client is one name. projects.client stays the name;
-- existing names are carried over so nothing already grouped changes.
create table clients (
  name       text primary key,
  created_at timestamptz not null default now()
);
alter table clients enable row level security;
insert into clients (name) select distinct client from projects where client is not null and client <> '' on conflict do nothing;
