-- Migration 008: Auto-cleanup expired listings & exclude expired posts from 5-listing limit

-- 1. Statement-level cleanup function (runs once per INSERT, zero idle compute)
create or replace function public.cleanup_expired_listings()
returns trigger as $$
begin
  -- Immediately delete expired 24h urgent requests
  delete from public.listings
  where type = 'request'
    and expires_at < now();

  -- Delete expired 30-day lend/sell posts after a 7-day grace period for renewal
  delete from public.listings
  where type in ('lend', 'sell')
    and expires_at < now() - interval '7 days';

  -- Delete completed ('done') listings older than 30 days
  delete from public.listings
  where status = 'done'
    and created_at < now() - interval '30 days';

  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_listing_insert_cleanup_expired on public.listings;
create trigger on_listing_insert_cleanup_expired
  after insert on public.listings
  for each statement execute function public.cleanup_expired_listings();

-- 2. Exclude expired listings from the 5-active-listing limit (INSERT)
create or replace function public.check_user_listing_limit()
returns trigger as $$
declare
  active_count int;
begin
  if new.status = 'available' then
    select count(*)
    into active_count
    from public.listings
    where owner_id = new.owner_id
      and status = 'available'
      and expires_at > now();

    if active_count >= 5 then
      raise exception 'Listing limit reached: A user may have at most 5 available listings at once.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 3. Exclude expired listings from the 5-active-listing limit (UPDATE)
create or replace function public.check_user_listing_limit_on_update()
returns trigger as $$
declare
  active_count int;
begin
  if new.status = 'available' and old.status <> 'available' then
    select count(*)
    into active_count
    from public.listings
    where owner_id = new.owner_id
      and status = 'available'
      and expires_at > now()
      and id <> new.id;

    if active_count >= 5 then
      raise exception 'Listing limit reached: A user may have at most 5 available listings at once.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
