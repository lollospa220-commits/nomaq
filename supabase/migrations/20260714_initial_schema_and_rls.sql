-- Nomaq — schema base + RLS (idempotente, rieseguibile).
-- ORDINE: eseguire su Supabase SQL Editor PRIMA del deploy che usa departure_date.
-- Include anche 20260710_flights_add_departure_date (colonna departure_date).

-- ── Estensioni ───────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Tabelle ──────────────────────────────────────────────────────────────────

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

create table if not exists public.flights (
  id text primary key,
  destination text not null,
  country text,
  price integer not null,
  original_price integer not null,
  description text,
  image text,
  airline text,
  date_info text,
  tag text,
  color text,
  duration text,
  departure_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.hotels (
  id text primary key,
  destination text not null,
  country text,
  price integer not null,
  original_price integer not null,
  description text,
  image text,
  hotel_name text,
  stars integer,
  rating numeric(3,1),
  nights text,
  date_info text,
  tag text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  item_id text not null,
  item_type text not null check (item_type in ('flight', 'hotel')),
  created_at timestamptz not null default now(),
  constraint saved_items_session_item_unique unique (session_id, item_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Colonna aggiunta dal fix preferiti (id stabili flight-tp-*)
alter table public.flights
  add column if not exists departure_date date;

-- ── Trigger profilo alla registrazione ───────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), profiles.full_name),
    avatar_url = coalesce(nullif(excluded.avatar_url, ''), profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.waitlist enable row level security;
alter table public.flights enable row level security;
alter table public.hotels enable row level security;
alter table public.saved_items enable row level security;
alter table public.profiles enable row level security;

-- Catalogo voli/hotel: sola lettura pubblica (scritture solo service_role).
drop policy if exists "flights_public_read" on public.flights;
create policy "flights_public_read" on public.flights
  for select to anon, authenticated using (true);

drop policy if exists "hotels_public_read" on public.hotels;
create policy "hotels_public_read" on public.hotels
  for select to anon, authenticated using (true);

-- Waitlist: niente SELECT anon (evita enumerazione email). INSERT solo service_role via API.
drop policy if exists "waitlist_no_public_read" on public.waitlist;
create policy "waitlist_no_public_read" on public.waitlist
  for select to anon using (false);

drop policy if exists "waitlist_no_public_insert" on public.waitlist;
create policy "waitlist_no_public_insert" on public.waitlist
  for insert to anon with check (false);

-- Preferiti: niente accesso diretto dal browser; solo API con service_role.
drop policy if exists "saved_items_no_public" on public.saved_items;
create policy "saved_items_no_public" on public.saved_items
  for all to anon using (false) with check (false);

-- Profilo: l'utente autenticato legge/aggiorna solo la propria riga.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- ── OPZIONALE: pulizia preferiti orfani (vecchi id datati) ───────────────────
-- delete from public.saved_items
--  where item_id ~ '^flight-tp-[A-Z]{3}-[0-9]{4}-[0-9]{2}-[0-9]{2}$';