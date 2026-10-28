-- Comments on a board item (action, question or decision). Author is a name, optional, because there is no sign-in.
create table comments (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references items(id) on delete cascade,
  author     text,
  body       text not null,
  created_at timestamptz not null default now()
);
create index comments_item_idx on comments (item_id, created_at);
alter table comments enable row level security;
