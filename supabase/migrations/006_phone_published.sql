-- Teléfono publicado opcional (agencias opacas sin línea online)

alter table agencies
  add column if not exists phone_published boolean not null default true;

alter table agency_submissions
  add column if not exists no_phone_online boolean not null default false;

alter table agency_submissions
  alter column phone drop not null;

alter table claims
  add column if not exists verification_path text not null default 'business_phone';
