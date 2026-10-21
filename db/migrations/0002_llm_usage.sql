-- Daily count of LLM generations across the whole demo. The public link has no sign-in,
-- so one shared cap per day is the honest way to bound the OpenAI bill. See DAILY_GENERATION_CAP.
create table llm_usage (
  day date primary key,
  n   integer not null default 0
);
