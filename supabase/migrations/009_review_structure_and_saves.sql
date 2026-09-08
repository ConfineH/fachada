-- Glassdoor-style review fields, helpful votes, saved agencies.

alter table reviews
  add column if not exists pros text,
  add column if not exists cons text,
  add column if not exists anonymous boolean not null default true,
  add column if not exists public_name text,
  add column if not exists would_recommend boolean,
  add column if not exists helpful_count integer not null default 0;

create table if not exists review_helpful (
  user_id uuid not null references users(id) on delete cascade,
  review_id uuid not null references reviews(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, review_id)
);

alter table review_helpful enable row level security;
revoke all on table review_helpful from anon, authenticated;

create table if not exists saved_agencies (
  user_id uuid not null references users(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, agency_id)
);

alter table saved_agencies enable row level security;
revoke all on table saved_agencies from anon, authenticated;
