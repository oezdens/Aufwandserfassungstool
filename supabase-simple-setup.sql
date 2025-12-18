-- EINFACHES SETUP - Führe dieses Script in Supabase SQL Editor aus
-- Dieses Script deaktiviert RLS temporär zum Testen

-- 1. Zuerst RLS deaktivieren (für Tests)
alter table if exists public.users disable row level security;
alter table if exists public.categories disable row level security;
alter table if exists public.performances disable row level security;
alter table if exists public.psp_elements disable row level security;
alter table if exists public.time_cards disable row level security;
alter table if exists public.time_entries disable row level security;

-- 2. UUID Extension aktivieren
create extension if not exists "uuid-ossp";

-- 3. Users Tabelle (ohne Foreign Key zu auth.users für einfacheres Testen)
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  manager_id uuid references public.users(id),
  manager_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Categories Tabelle
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Performances Tabelle
create table if not exists public.performances (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PSP Elements Tabelle
create table if not exists public.psp_elements (
  id uuid primary key default uuid_generate_v4(),
  performance_id uuid references public.performances(id) on delete cascade,
  code text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Time Cards Tabelle (OHNE Foreign Key zu users für einfacheres Testen)
drop table if exists public.time_entries cascade;
drop table if exists public.time_cards cascade;

create table public.time_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  week_label text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text not null default 'Geöffnet',
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Time Entries Tabelle
create table public.time_entries (
  id uuid primary key default uuid_generate_v4(),
  time_card_id uuid references public.time_cards(id) on delete cascade not null,
  category_id uuid,
  performance_id uuid,
  psp_element_id uuid,
  hours numeric[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Seed Data für Categories
insert into public.categories (id, name) values 
  ('00000000-0000-0000-0000-000000000001', 'Projekt'),
  ('00000000-0000-0000-0000-000000000002', 'Interne Leistung'),
  ('00000000-0000-0000-0000-000000000003', 'Abwesenheit')
on conflict (id) do nothing;

-- 10. Seed Data für Performances
insert into public.performances (id, category_id, name) values 
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Entwicklung'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Design'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000002', 'Meeting'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000003', 'Urlaub')
on conflict (id) do nothing;

-- 11. Seed Data für PSP Elements
insert into public.psp_elements (id, performance_id, code, description) values 
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'IM-006-R1026-00', 'NSU, R'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'IM-007-A2000-01', 'AUDI, Q4'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000002', 'UX-2024-DESIGN', 'UX Design Global')
on conflict (id) do nothing;

-- Fertig! Jetzt sollte alles funktionieren.
