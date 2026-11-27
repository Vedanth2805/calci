-- Migration 010: Allow optional reward/offer price (e.g. ₹10, ₹20, < ₹100) on request listings

alter table public.listings
  drop constraint if exists check_listing_price;

alter table public.listings
  add constraint check_listing_price
  check (
    (type = 'sell' and price is not null and price > 0) or
    (type in ('lend', 'request') and (price is null or price > 0))
  );
