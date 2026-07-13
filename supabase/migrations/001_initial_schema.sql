-- Fachada initial schema (PostgreSQL / Supabase)
-- Mirrors architecture doc entities

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

create index if not exists idx_agencies_city on agencies(city);
create index if not exists idx_agencies_name on agencies(name);
create index if not exists idx_reviews_agency on reviews(agency_id);
create index if not exists idx_reviews_user_agency on reviews(user_id, agency_id, created_at desc);
