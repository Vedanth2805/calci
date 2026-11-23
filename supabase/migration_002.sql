-- ==============================================================================
-- CalciShare - Migration 002: Enforce Maximum 5 Available Listings Per User
-- Run this in the Supabase SQL Editor
-- ==============================================================================

-- 1. Trigger function: checks that a user has at most 5 available listings
create or replace function public.check_user_listing_limit()
returns trigger as $$
declare
  active_count int;
begin
  -- Enforce only for listings being created with 'available' status
  if new.status = 'available' then
    select count(*)
    into active_count
    from public.listings
    where owner_id = new.owner_id
      and status = 'available';

    if active_count >= 5 then
      raise exception 'Listing limit reached: A user may have at most 5 available listings at once.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 2. Drop existing trigger if already present for idempotent execution
drop trigger if exists on_listing_created_check_limit on public.listings;

-- 3. BEFORE INSERT trigger on listings
create trigger on_listing_created_check_limit
  before insert on public.listings
  for each row execute function public.check_user_listing_limit();
