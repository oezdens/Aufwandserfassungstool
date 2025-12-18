-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  manager_id uuid references public.users(id),
  manager_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories table
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Performances table
create table if not exists public.performances (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PSP Elements table
create table if not exists public.psp_elements (
  id uuid primary key default uuid_generate_v4(),
  performance_id uuid references public.performances(id) on delete cascade not null,
  code text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Time Cards table
create table if not exists public.time_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  week_label text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text not null default 'Geöffnet',
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Time Entries table
create table if not exists public.time_entries (
  id uuid primary key default uuid_generate_v4(),
  time_card_id uuid references public.time_cards(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  performance_id uuid references public.performances(id) on delete set null,
  psp_element_id uuid references public.psp_elements(id) on delete set null,
  hours numeric[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.performances enable row level security;
alter table public.psp_elements enable row level security;
alter table public.time_cards enable row level security;
alter table public.time_entries enable row level security;

-- Policies for users
create policy "Users can view all users" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Enable insert for authenticated users" on public.users
  for insert with check (auth.uid() = id);

-- Policies for categories (all authenticated users can CRUD)
create policy "Categories are viewable by everyone" on public.categories
  for select using (true);

create policy "Authenticated users can insert categories" on public.categories
  for insert with check (auth.uid() is not null);

create policy "Authenticated users can update categories" on public.categories
  for update using (auth.uid() is not null);

create policy "Authenticated users can delete categories" on public.categories
  for delete using (auth.uid() is not null);

-- Policies for performances
create policy "Performances are viewable by everyone" on public.performances
  for select using (true);

create policy "Authenticated users can insert performances" on public.performances
  for insert with check (auth.uid() is not null);

create policy "Authenticated users can update performances" on public.performances
  for update using (auth.uid() is not null);

create policy "Authenticated users can delete performances" on public.performances
  for delete using (auth.uid() is not null);

-- Policies for psp_elements
create policy "PSP Elements are viewable by everyone" on public.psp_elements
  for select using (true);

create policy "Authenticated users can insert psp_elements" on public.psp_elements
  for insert with check (auth.uid() is not null);

create policy "Authenticated users can update psp_elements" on public.psp_elements
  for update using (auth.uid() is not null);

create policy "Authenticated users can delete psp_elements" on public.psp_elements
  for delete using (auth.uid() is not null);

-- Policies for time_cards
create policy "Users can view own time cards" on public.time_cards
  for select using (auth.uid() = user_id);

create policy "Managers can view team time cards" on public.time_cards
  for select using (
    exists (
      select 1 from public.users 
      where users.id = time_cards.user_id 
      and users.manager_id = auth.uid()
    )
  );

create policy "Users can insert own time cards" on public.time_cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update own time cards" on public.time_cards
  for update using (auth.uid() = user_id);

create policy "Managers can update team time cards" on public.time_cards
  for update using (
    exists (
      select 1 from public.users 
      where users.id = time_cards.user_id 
      and users.manager_id = auth.uid()
    )
  );

-- Policies for time_entries
create policy "Users can view own time entries" on public.time_entries
  for select using (
    exists (
      select 1 from public.time_cards 
      where time_cards.id = time_entries.time_card_id 
      and time_cards.user_id = auth.uid()
    )
  );

create policy "Managers can view team time entries" on public.time_entries
  for select using (
    exists (
      select 1 from public.time_cards 
      join public.users on users.id = time_cards.user_id
      where time_cards.id = time_entries.time_card_id 
      and users.manager_id = auth.uid()
    )
  );

create policy "Users can insert own time entries" on public.time_entries
  for insert with check (
    exists (
      select 1 from public.time_cards 
      where time_cards.id = time_entries.time_card_id 
      and time_cards.user_id = auth.uid()
    )
  );

create policy "Users can update own time entries" on public.time_entries
  for update using (
    exists (
      select 1 from public.time_cards 
      where time_cards.id = time_entries.time_card_id 
      and time_cards.user_id = auth.uid()
    )
  );

create policy "Users can delete own time entries" on public.time_entries
  for delete using (
    exists (
      select 1 from public.time_cards 
      where time_cards.id = time_entries.time_card_id 
      and time_cards.user_id = auth.uid()
    )
  );

-- Insert initial seed data for categories
insert into public.categories (id, name) values 
  ('00000000-0000-0000-0000-000000000001', 'Projekt'),
  ('00000000-0000-0000-0000-000000000002', 'Interne Leistung'),
  ('00000000-0000-0000-0000-000000000003', 'Abwesenheit')
on conflict (id) do nothing;

-- Insert initial seed data for performances
insert into public.performances (id, category_id, name) values 
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Entwicklung'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Design'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000002', 'Meeting'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000003', 'Urlaub')
on conflict (id) do nothing;

-- Insert initial seed data for psp_elements
insert into public.psp_elements (id, performance_id, code, description) values 
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'IM-006-R1026-00', 'NSU, R'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'IM-007-A2000-01', 'AUDI, Q4'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000002', 'UX-2024-DESIGN', 'UX Design Global')
on conflict (id) do nothing;

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
