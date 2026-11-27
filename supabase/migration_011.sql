-- Migration 011: Add available_until date + fast stale-listing hiding on reports

-- 1. Add available_until date column for lend & request listings
alter table public.listings
  add column if not exists available_until date;

-- 2. Update report trigger so "Already sold / lent" flags hide stale listings faster (2 flags = hidden)
create or replace function public.handle_new_report()
returns trigger as $$
declare
  weight int := 1;
begin
  if new.reason is not null and new.reason ilike 'Already sold / lent%' then
    weight := 2;
  end if;

  update public.listings
  set report_count = report_count + weight
  where id = new.listing_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
