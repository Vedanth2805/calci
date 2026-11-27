-- Migration 009: Lending fee (Free or < ₹100) + Trust rule (ID photo + phone or none)

-- 1. Add trust_rule column for lending posts
alter table public.listings
  add column if not exists trust_rule text;

alter table public.listings
  drop constraint if exists listings_trust_rule_check;

alter table public.listings
  add constraint listings_trust_rule_check
  check (trust_rule is null or trust_rule in ('id_proof', 'none'));

-- 2. Allow lend listings to have either null (Free) or a positive price (small fee)
alter table public.listings
  drop constraint if exists check_listing_price;

alter table public.listings
  add constraint check_listing_price
  check (
    (type = 'sell' and price is not null and price > 0) or
    (type = 'lend' and (price is null or price > 0)) or
    (type = 'request' and price is null)
  );
