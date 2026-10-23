-- Calculator that sent the visitor to the review. Empty when they did not come from one.
-- Carried in the URL (?desde=), never in a cookie or localStorage.

alter table reviews
  add column if not exists origen text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_origen_check'
  ) then
    alter table reviews add constraint reviews_origen_check
      check (
        origen is null
        or origen in (
          'honorarios',
          'fianza',
          'reparaciones',
          'desistimiento',
          'acta',
          'subida'
        )
      );
  end if;
end $$;
