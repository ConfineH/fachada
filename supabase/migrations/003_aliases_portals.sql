-- Fachada: aliases, portal URLs, legal fields

alter table agencies
  add column if not exists legal_name text,
  add column if not exists idealista_url text,
  add column if not exists fotocasa_url text;

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
