-- User-submitted ficha corrections: principal/branch offices and name history.

create table if not exists agency_tips (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  kind text not null check (
    kind in ('principal', 'branch', 'former_name', 'legal_name')
  ),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'aprobado', 'rechazado')),
  address text,
  city text,
  postal_code text,
  label text,
  alias text,
  year int,
  note text,
  source_url text,
  evidence_path text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_agency_tips_agency on agency_tips(agency_id);
create index if not exists idx_agency_tips_status on agency_tips(status);

alter table agency_tips enable row level security;
revoke all on table agency_tips from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agency-tip-evidence',
  'agency-tip-evidence',
  false,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
