alter table content_notices
  add column if not exists reporter_ip text;
