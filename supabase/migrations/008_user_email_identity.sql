-- Email identity for reviewers (Glassdoor-style). Phone stays optional for legacy SMS.

alter table users
  alter column phone drop not null;

alter table users
  add column if not exists email text,
  add column if not exists email_verified boolean not null default false;

create unique index if not exists users_email_unique on users (email)
  where email is not null;

create table if not exists pending_email_verifications (
  email text primary key,
  code text not null,
  expires_at timestamptz not null
);

alter table pending_email_verifications enable row level security;
revoke all on table pending_email_verifications from anon, authenticated;
