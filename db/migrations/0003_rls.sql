-- Supabase exposes the public schema over its REST API with a public anon key.
-- RLS with no policies blocks that path; the app connects as the table owner, which bypasses RLS.
alter table projects enable row level security;
alter table meetings enable row level security;
alter table items enable row level security;
alter table llm_usage enable row level security;
alter table _migrations enable row level security;
