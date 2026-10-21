-- Fichas provisionales creadas al publicar una reseña, y conteo simple de la landing /inquilinos.
-- La aplica Jose en el Supabase que use el despliegue. Este archivo no se ejecuta solo.

alter table agencies
  add column if not exists provisional boolean not null default false;

create table if not exists promo_visits (
  source text not null,
  campaign text not null,
  visits integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (source, campaign)
);

alter table promo_visits enable row level security;
revoke all on table promo_visits from anon, authenticated;
