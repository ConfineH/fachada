-- User-suggested agencies (Google Maps "add a missing place" flow)

create table if not exists agency_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  city text not null,
  postal_code text not null,
  address text not null,
  phone text not null,
  email text,
  website text,
  idealista_url text,
  note text,
  status text not null check (status in ('pendiente', 'aprobado', 'rechazado')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_agency_id uuid references agencies(id) on delete set null,
  created_agency_slug text
);

create index if not exists idx_agency_submissions_status on agency_submissions(status);
