alter table reviews
  add column if not exists edited_at timestamptz,
  add column if not exists deleted_at timestamptz;

create index if not exists idx_reviews_deleted_at
  on reviews(deleted_at);
