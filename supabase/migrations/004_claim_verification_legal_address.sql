-- Claim anti-impersonation fields + legal address

alter table agencies
  add column if not exists legal_address text;

alter table claims
  add column if not exists representative_role text,
  add column if not exists company_cif text,
  add column if not exists evidence jsonb not null default '[]',
  add column if not exists attestation_accepted boolean not null default false,
  add column if not exists business_phone_verified boolean not null default false,
  add column if not exists work_email_domain_match boolean not null default false;

create table if not exists pending_business_line_verifications (
  user_id uuid not null references users(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  primary key (user_id, agency_id)
);

create table if not exists agency_business_line_verified (
  user_id uuid not null references users(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (user_id, agency_id)
);
