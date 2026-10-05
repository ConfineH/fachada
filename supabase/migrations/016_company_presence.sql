-- One company, many cities. Reviews keep a city for filtering inside the ficha.
-- Same commercial name collapses into one row unless the CIFs differ.

alter table agencies
  add column if not exists brand_slug text,
  add column if not exists brand_name text;

alter table reviews
  add column if not exists experience_city text;

create table if not exists agency_slug_redirects (
  slug text primary key,
  agency_id uuid not null references agencies(id) on delete cascade
);

alter table agency_slug_redirects enable row level security;
revoke all on table agency_slug_redirects from anon, authenticated;

create index if not exists idx_agencies_brand_slug on agencies(brand_slug);
create index if not exists idx_reviews_experience_city on reviews(experience_city);

create or replace function fachada_brand_slug(raw text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(translate(btrim(raw), 'áéíóúüñÁÉÍÓÚÜÑöÖ', 'aeiouunaeiouunoo')),
    '[^a-z0-9]+',
    '-',
    'g'
  ));
$$;

revoke all on function fachada_brand_slug(text) from public, anon, authenticated;

do $$
declare
  grp record;
  keeper uuid;
  drop_id uuid;
  i int;
  keeper_slug text;
  next_slug text;
begin
  for grp in
    select array_agg(
      id order by (lower(btrim(city)) = 'madrid') desc, created_at asc, id asc
    ) as ids
    from agencies
    group by lower(btrim(name))
    having count(*) > 1
       and count(distinct nullif(upper(regexp_replace(coalesce(cif, ''), '\s', '', 'g')), '')) <= 1
  loop
    keeper := grp.ids[1];

    for i in 2 .. cardinality(grp.ids) loop
      drop_id := grp.ids[i];

      insert into agency_slug_redirects (slug, agency_id)
      select slug, keeper from agencies where id = drop_id
      on conflict (slug) do update set agency_id = excluded.agency_id;

      insert into agency_locations (agency_id, kind, status, address, city, postal_code)
      select keeper, 'branch', 'publicado', d.address, d.city, d.postal_code
      from agencies d
      where d.id = drop_id
        and not (
          lower(btrim(d.city)) = (select lower(btrim(city)) from agencies where id = keeper)
          and lower(btrim(d.address)) = (select lower(btrim(address)) from agencies where id = keeper)
        )
        and not exists (
          select 1 from agency_locations l
          where l.agency_id = keeper
            and lower(btrim(l.city)) = lower(btrim(d.city))
            and lower(btrim(l.address)) = lower(btrim(d.address))
        );

      update reviews set agency_id = keeper where agency_id = drop_id;
      update claims set agency_id = keeper where agency_id = drop_id;
      update agency_responses set agency_id = keeper where agency_id = drop_id;
      update agency_name_aliases set agency_id = keeper where agency_id = drop_id;
      update agency_locations set agency_id = keeper where agency_id = drop_id;
      update agency_tips set agency_id = keeper where agency_id = drop_id;
      update agency_submissions set created_agency_id = keeper where created_agency_id = drop_id;
      update agency_slug_redirects set agency_id = keeper where agency_id = drop_id;

      delete from saved_agencies s
      using saved_agencies keep
      where s.agency_id = drop_id
        and keep.agency_id = keeper
        and keep.user_id = s.user_id;
      update saved_agencies set agency_id = keeper where agency_id = drop_id;

      delete from pending_business_line_verifications p
      using pending_business_line_verifications keep
      where p.agency_id = drop_id
        and keep.agency_id = keeper
        and keep.user_id = p.user_id;
      update pending_business_line_verifications set agency_id = keeper where agency_id = drop_id;

      delete from agency_business_line_verified p
      using agency_business_line_verified keep
      where p.agency_id = drop_id
        and keep.agency_id = keeper
        and keep.user_id = p.user_id;
      update agency_business_line_verified set agency_id = keeper where agency_id = drop_id;

      delete from agencies where id = drop_id;
    end loop;
  end loop;

  update agencies
  set
    brand_name = name,
    brand_slug = fachada_brand_slug(name)
  where brand_slug is null or brand_name is null;

  for keeper_slug, keeper, next_slug in
    select slug, id, fachada_brand_slug(name)
    from agencies
  loop
    if next_slug is null or next_slug = '' or next_slug = keeper_slug then
      continue;
    end if;
    if exists (select 1 from agencies where slug = next_slug and id <> keeper) then
      continue;
    end if;
    insert into agency_slug_redirects (slug, agency_id)
    values (keeper_slug, keeper)
    on conflict (slug) do update set agency_id = excluded.agency_id;
    update agencies set slug = next_slug where id = keeper;
  end loop;
end $$;
