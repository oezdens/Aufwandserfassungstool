-- Dieses Script aktualisiert die RLS-Policies für time_cards
-- Falls die Tabellen schon existieren aber nicht funktionieren

-- Zuerst alte Policies entfernen (falls vorhanden)
drop policy if exists "Users can view own time cards" on public.time_cards;
drop policy if exists "Managers can view team time cards" on public.time_cards;
drop policy if exists "Users can insert own time cards" on public.time_cards;
drop policy if exists "Users can update own time cards" on public.time_cards;
drop policy if exists "Managers can update team time cards" on public.time_cards;

drop policy if exists "Users can view own time entries" on public.time_entries;
drop policy if exists "Managers can view team time entries" on public.time_entries;
drop policy if exists "Users can insert own time entries" on public.time_entries;
drop policy if exists "Users can update own time entries" on public.time_entries;
drop policy if exists "Users can delete own time entries" on public.time_entries;

-- Neue, vereinfachte Policies für time_cards
create policy "Users can view own time cards" on public.time_cards
  for select using (auth.uid() = user_id);

create policy "Users can insert own time cards" on public.time_cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update own time cards" on public.time_cards
  for update using (auth.uid() = user_id);

create policy "Users can delete own time cards" on public.time_cards
  for delete using (auth.uid() = user_id);

-- Neue, vereinfachte Policies für time_entries
create policy "Users can view own time entries" on public.time_entries
  for select using (
    exists (
      select 1 from public.time_cards 
      where time_cards.id = time_entries.time_card_id 
      and time_cards.user_id = auth.uid()
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

-- Alternativ: RLS für time_cards und time_entries deaktivieren (nur zum Testen!)
-- ACHTUNG: Nur zum Testen verwenden, nicht in Produktion!
-- alter table public.time_cards disable row level security;
-- alter table public.time_entries disable row level security;
