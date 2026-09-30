alter table reviews
  add column if not exists incident_sentiments jsonb not null default '{}'::jsonb;
