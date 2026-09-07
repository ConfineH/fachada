-- Cloud catch-up: columns/tables after initial_schema + incident tags.
-- Applied to project embmicoogxrxsvchywis as schema_aliases_claims_submissions_tags.

alter table agencies
  add column if not exists legal_name text,
  add column if not exists legal_address text,
  add column if not exists idealista_url text,
  add column if not exists fotocasa_url text,
  add column if not exists phone_published boolean not null default true;

create table if not exists agency_name_aliases (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  alias text not null,
  kind text not null check (kind in ('commercial', 'legal')),
  effective_until timestamptz,
  source_url text,
  note text
);

create index if not exists idx_agency_aliases_agency on agency_name_aliases(agency_id);
create index if not exists idx_agency_aliases_alias on agency_name_aliases(alias);

alter table claims
  add column if not exists representative_role text,
  add column if not exists company_cif text,
  add column if not exists evidence jsonb not null default '[]',
  add column if not exists attestation_accepted boolean not null default false,
  add column if not exists business_phone_verified boolean not null default false,
  add column if not exists work_email_domain_match boolean not null default false,
  add column if not exists verification_path text not null default 'business_phone';

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

create table if not exists agency_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  city text not null,
  postal_code text not null,
  address text not null,
  phone text,
  email text,
  website text,
  idealista_url text,
  note text,
  status text not null check (status in ('pendiente', 'aprobado', 'rechazado')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_agency_id uuid references agencies(id) on delete set null,
  created_agency_slug text,
  no_phone_online boolean not null default false
);

create index if not exists idx_agency_submissions_status on agency_submissions(status);

alter table reviews
  add column if not exists incident_tags text[] not null default '{}';

alter table reviews drop constraint if exists reviews_incident_tags_allowed;
alter table reviews add constraint reviews_incident_tags_allowed
  check (
    incident_tags <@ array[
      'honorarios_gestion',
      'seguro_impuesto',
      'fianza',
      'reparaciones',
      'comunicacion',
      'renovacion',
      'otros'
    ]::text[]
  );

alter table agency_name_aliases enable row level security;
alter table pending_business_line_verifications enable row level security;
alter table agency_business_line_verified enable row level security;
alter table agency_submissions enable row level security;

revoke all on table agency_name_aliases from anon, authenticated;
revoke all on table pending_business_line_verifications from anon, authenticated;
revoke all on table agency_business_line_verified from anon, authenticated;
revoke all on table agency_submissions from anon, authenticated;
