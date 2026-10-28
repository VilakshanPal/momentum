-- Company-level team: the people every project picks its teammates from. Names, because every other
-- person reference in the product (participants, owners) is a name too.
create table people (
  name       text primary key,
  created_at timestamptz not null default now()
);
alter table people enable row level security;
