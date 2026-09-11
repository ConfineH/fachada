-- Extra offices / reported sightings + former trading names

alter table agency_name_aliases drop constraint if exists agency_name_aliases_kind_check;

alter table agency_name_aliases
  add constraint agency_name_aliases_kind_check
  check (kind in ('commercial', 'legal', 'former'));

create table if not exists agency_locations (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  kind text not null check (kind in ('branch', 'reported')),
  status text not null default 'publicado'
    check (status in ('pendiente', 'publicado')),
  label text,
  address text not null,
  city text not null,
  postal_code text not null default '',
  note text,
  source_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_agency_locations_agency
  on agency_locations(agency_id);

create index if not exists idx_agency_locations_status
  on agency_locations(status);

alter table agency_locations enable row level security;
revoke all on table agency_locations from anon, authenticated;
