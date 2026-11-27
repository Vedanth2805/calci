-- Migration 007: Support "request" (Need a Calci) listings with 24h auto-expiry

alter table public.listings
  drop constraint if exists listings_type_check;

alter table public.listings
  add constraint listings_type_check
  check (type in ('lend', 'sell', 'request'));

alter table public.listings
  drop constraint if exists check_listing_price;

alter table public.listings
  add constraint check_listing_price
  check (
    (type = 'sell' and price is not null and price > 0) or
    (type in ('lend', 'request') and price is null)
  );
