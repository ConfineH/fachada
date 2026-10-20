-- Immediate publication with an automatic prefilter, plus an audited mode switch.

alter table reviews
  add column if not exists prefilter_outcome text,
  add column if not exists prefilter_codes text[] not null default '{}',
  add column if not exists prefilter_reasons text[] not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_prefilter_outcome_check'
  ) then
    alter table reviews add constraint reviews_prefilter_outcome_check
      check (prefilter_outcome is null or prefilter_outcome in ('clean', 'held'));
  end if;
end $$;

do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'content_notices'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%honor%';
  if constraint_name is not null then
    execute format('alter table content_notices drop constraint %I', constraint_name);
  end if;
end $$;

alter table content_notices
  add constraint content_notices_category_check
  check (
    category in (
      'honor',
      'privacy',
      'personal_data',
      'threat',
      'intellectual_property',
      'fake_experience',
      'other_illegal',
      'false_statement',
      'not_customer',
      'offensive_or_crime',
      'spam',
      'other'
    )
  );

create table if not exists publication_policy (
  id int primary key default 1 check (id = 1),
  mode text not null default 'immediate' check (mode in ('immediate', 'premoderation')),
  updated_at timestamptz not null default now(),
  updated_by text not null default 'valor por defecto'
);

insert into publication_policy (id, mode, updated_by)
values (1, 'immediate', 'valor por defecto')
on conflict (id) do nothing;

create table if not exists publication_policy_audit (
  id uuid primary key,
  mode text not null,
  previous_mode text not null,
  changed_by text not null,
  changed_at timestamptz not null default now()
);

alter table publication_policy enable row level security;
alter table publication_policy_audit enable row level security;
revoke all on table publication_policy from anon, authenticated;
revoke all on table publication_policy_audit from anon, authenticated;
