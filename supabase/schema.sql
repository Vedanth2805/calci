-- ==============================================================================
-- CalciShare - Database Schema & Security Setup
-- Safe to run once in the Supabase SQL editor
-- ==============================================================================

-- 1. Profiles Table
-- Stores academic details extracted from VVCE student emails.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  admission_year int,
  branch text,
  created_at timestamptz not null default now()
);

-- 2. Listings Table
-- Stores calculator lending or selling posts.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  calculator_model text not null,
  type text not null check (type in ('lend', 'sell')),
  price int,
  contact_type text not null check (contact_type in ('instagram', 'discord')),
  contact_handle text not null check (char_length(contact_handle) >= 2 and char_length(contact_handle) <= 50),
  note text check (note is null or char_length(note) <= 200),
  status text not null default 'available' check (status in ('available', 'done')),
  report_count int not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  constraint check_listing_price check (
    (type = 'sell' and price is not null and price > 0) or
    (type = 'lend' and price is null)
  )
);

-- 3. Reports Table
-- Stores student reports on inappropriate or stale listings.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text check (reason is null or char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  constraint unique_listing_reporter unique (listing_id, reporter_id)
);

-- ==============================================================================
-- Indexes
-- ==============================================================================
create index if not exists idx_listings_status_expires_at on public.listings (status, expires_at);
create index if not exists idx_listings_type on public.listings (type);
create index if not exists idx_listings_calculator_model on public.listings (calculator_model);

-- ==============================================================================
-- Functions and Triggers
-- ==============================================================================

-- Trigger 1: BEFORE INSERT on auth.users (Domain Spam Wall)
-- Ensures only @vvce.ac.in emails can register.
create or replace function public.check_user_email_domain()
returns trigger as $$
begin
  if new.email is null or lower(trim(new.email)) not like '%@vvce.ac.in' then
    raise exception 'Access denied: Only @vvce.ac.in email addresses are permitted.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created_check_domain on auth.users;
create trigger on_auth_user_created_check_domain
  before insert on auth.users
  for each row execute function public.check_user_email_domain();

-- Trigger 2: AFTER INSERT on auth.users (Profile Creation & Local-Part Parser)
-- Example local part: 'vvce24cse463' -> admission_year = 2024, branch = 'CSE'.
-- Inserts nulls instead of failing signup if parsing fails.
create or replace function public.handle_new_user_profile()
returns trigger as $$
declare
  local_part text;
  matches text[];
  parsed_year int := null;
  parsed_branch text := null;
begin
  begin
    if new.email is not null then
      local_part := split_part(lower(trim(new.email)), '@', 1);
      matches := regexp_match(local_part, '^vvce([0-9]{2})([a-zA-Z]+)');
      if matches is not null and array_length(matches, 1) >= 2 then
        parsed_year := 2000 + (matches[1])::int;
        parsed_branch := upper(matches[2]);
      end if;
    end if;
  exception
    when others then
      parsed_year := null;
      parsed_branch := null;
  end;

  insert into public.profiles (id, admission_year, branch)
  values (new.id, parsed_year, parsed_branch)
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Trigger 3: AFTER INSERT on reports
-- Automatically increments listings.report_count by 1.
create or replace function public.handle_new_report()
returns trigger as $$
begin
  update public.listings
  set report_count = report_count + 1
  where id = new.listing_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_report_inserted on public.reports;
create trigger on_report_inserted
  after insert on public.reports
  for each row execute function public.handle_new_report();

-- ==============================================================================
-- Row Level Security (RLS)
-- Deny by default on all tables
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.reports enable row level security;

-- Profiles Policies:
-- Authenticated users can view all profiles (only admission_year and branch exist here, no email).
drop policy if exists "Authenticated users can select profiles" on public.profiles;
create policy "Authenticated users can select profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Users can update only their own profile row.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Listings Policies:
-- Authenticated users can select available, unexpired, non-reported (< 3) listings, or their own listings.
drop policy if exists "Authenticated users can select listings" on public.listings;
create policy "Authenticated users can select listings"
  on public.listings
  for select
  to authenticated
  using (
    ((status = 'available' and expires_at > now() and report_count < 3) or owner_id = auth.uid())
  );

-- Authenticated users can insert listings only with owner_id = auth.uid().
drop policy if exists "Authenticated users can insert own listings" on public.listings;
create policy "Authenticated users can insert own listings"
  on public.listings
  for insert
  to authenticated
  with check (owner_id = auth.uid());

-- Authenticated users can update only their own listings.
drop policy if exists "Authenticated users can update own listings" on public.listings;
create policy "Authenticated users can update own listings"
  on public.listings
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Authenticated users can delete only their own listings.
drop policy if exists "Authenticated users can delete own listings" on public.listings;
create policy "Authenticated users can delete own listings"
  on public.listings
  for delete
  to authenticated
  using (owner_id = auth.uid());

-- Reports Policies:
-- Authenticated users can insert reports only with reporter_id = auth.uid() and cannot report their own listing.
-- No SELECT policy is created, meaning reports cannot be read via client queries.
drop policy if exists "Authenticated users can insert reports" on public.reports;
create policy "Authenticated users can insert reports"
  on public.reports
  for insert
  to authenticated
  with check (
    reporter_id = auth.uid()
    and not exists (
      select 1 from public.listings l
      where l.id = reports.listing_id and l.owner_id = auth.uid()
    )
  );
