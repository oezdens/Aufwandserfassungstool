-- NUR DIESES AUSFÜHREN - Deaktiviert RLS für time_cards und time_entries
alter table public.time_cards disable row level security;
alter table public.time_entries disable row level security;
alter table public.users disable row level security;
