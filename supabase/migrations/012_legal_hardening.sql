-- Review authenticity, moderation reasons and DSA notice-and-action.

alter table reviews
  add column if not exists experience_date date,
  add column if not exists experience_type text,
  add column if not exists first_hand_attested boolean not null default false,
  add column if not exists no_incentive_attested boolean not null default false,
  add column if not exists no_conflict_attested boolean not null default false,
  add column if not exists verification_level text not null default 'declarada',
  add column if not exists identity_verification text not null default 'email',
  add column if not exists evidence_path text,
  add column if not exists evidence_delete_after timestamptz,
  add column if not exists terms_version text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists moderation_reason text,
  add column if not exists moderated_at timestamptz;

update reviews
set
  experience_date = coalesce(experience_date, created_at::date),
  experience_type = coalesce(experience_type, 'alquiler'),
  terms_version = coalesce(terms_version, 'historical-before-2026-09'),
  terms_accepted_at = coalesce(terms_accepted_at, created_at);

alter table reviews
  alter column experience_date set not null,
  alter column experience_type set not null,
  alter column terms_version set not null,
  alter column terms_accepted_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_experience_type_check'
  ) then
    alter table reviews add constraint reviews_experience_type_check
      check (experience_type in ('visita', 'negociacion', 'alquiler', 'incidencia', 'gestion'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_verification_level_check'
  ) then
    alter table reviews add constraint reviews_verification_level_check
      check (verification_level in ('declarada', 'acreditada'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_identity_verification_check'
  ) then
    alter table reviews add constraint reviews_identity_verification_check
      check (identity_verification in ('email', 'phone'));
  end if;
end $$;

create table if not exists content_notices (
  id uuid primary key,
  review_id uuid not null references reviews(id) on delete cascade,
  reporter_name text not null,
  reporter_email text not null,
  relationship text,
  category text not null check (
    category in (
      'honor',
      'privacy',
      'personal_data',
      'threat',
      'intellectual_property',
      'fake_experience',
      'other_illegal'
    )
  ),
  exact_excerpt text not null,
  legal_reason text not null,
  evidence_url text,
  good_faith_attested boolean not null,
  status text not null default 'pendiente' check (
    status in ('pendiente', 'retirado', 'mantenido', 'informacion_requerida')
  ),
  review_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz not null default now(),
  decided_at timestamptz,
  decision_reason text,
  decision_rule text,
  author_notified_at timestamptz,
  reporter_notified_at timestamptz,
  appealed_at timestamptz,
  appeal_reason text,
  appeal_decided_at timestamptz,
  appeal_decision text check (appeal_decision in ('confirmada', 'revocada')),
  appeal_decision_reason text
);

create index if not exists idx_content_notices_status
  on content_notices(status, created_at);
create index if not exists idx_content_notices_review
  on content_notices(review_id);

alter table content_notices enable row level security;
revoke all on table content_notices from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-evidence',
  'review-evidence',
  false,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;
