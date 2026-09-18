alter table agencies
  add column if not exists logo_path text;

alter table agency_tips drop constraint if exists agency_tips_kind_check;
alter table agency_tips add constraint agency_tips_kind_check
  check (
    kind in ('principal', 'branch', 'former_name', 'legal_name', 'logo')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agency-logos',
  'agency-logos',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Public read agency logos" on storage.objects;
create policy "Public read agency logos"
on storage.objects
for select
using (bucket_id = 'agency-logos');
