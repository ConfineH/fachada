-- Fachada: core schema, auth tables, RLS, seed data

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  cif text,
  address text not null,
  city text not null,
  postal_code text not null,
  phone text not null,
  email text not null,
  website text,
  google_maps_url text,
  claimed boolean not null default false,
  verified boolean not null default false,
  premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  role text not null check (role in ('inquilino', 'propietario')),
  rating int not null check (rating between 1 and 5),
  title varchar(100) not null,
  body text not null check (char_length(body) <= 1000),
  created_at timestamptz not null default now(),
  moderated boolean not null default false,
  flagged boolean not null default false
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  documentation_urls text[] not null default '{}',
  status text not null check (status in ('pendiente', 'aprobado', 'rechazado')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists agency_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null unique references reviews(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  body text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);

create table if not exists pending_verifications (
  phone text primary key,
  code text not null,
  expires_at timestamptz not null
);

create table if not exists sessions (
  token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null
);

create index if not exists idx_agencies_city on agencies(city);
create index if not exists idx_agencies_name on agencies(name);
create index if not exists idx_reviews_agency on reviews(agency_id);
create index if not exists idx_reviews_user_agency on reviews(user_id, agency_id, created_at desc);
create index if not exists idx_claims_status on claims(status);
create index if not exists idx_reviews_moderated on reviews(moderated, flagged);

alter table users enable row level security;
alter table agencies enable row level security;
alter table reviews enable row level security;
alter table claims enable row level security;
alter table agency_responses enable row level security;
alter table pending_verifications enable row level security;
alter table sessions enable row level security;

revoke all on table users from anon, authenticated;
revoke all on table agencies from anon, authenticated;
revoke all on table reviews from anon, authenticated;
revoke all on table claims from anon, authenticated;
revoke all on table agency_responses from anon, authenticated;
revoke all on table pending_verifications from anon, authenticated;
revoke all on table sessions from anon, authenticated;

insert into agencies (slug, name, address, city, postal_code, phone, email)
values
  ('inmobiliaria-sol-madrid', 'Inmobiliaria Sol', 'Calle Mayor 12', 'Madrid', '28013', '+34911222333', 'info@inmobiliariasol.es'),
  ('gestion-urbana-madrid', 'Gestión Urbana', 'Gran Vía 45', 'Madrid', '28013', '+34911444555', 'hola@gestionurbana.es'),
  ('pisos-barcelona', 'Pisos Barcelona', 'Passeig de Gràcia 1', 'Barcelona', '08007', '+34933666777', 'contacto@pisosbarcelona.es')
on conflict (slug) do nothing;
