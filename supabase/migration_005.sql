-- Migration 005: Performance indexes for /board, /post, and /my-listings queries

-- Speed up /my-listings and /post active listing count queries by owner_id
create index if not exists idx_listings_owner_created
  on public.listings (owner_id, created_at desc);

-- Speed up /board main query (available, non-reported, ordered by newest)
create index if not exists idx_listings_board_active
  on public.listings (status, expires_at, created_at desc)
  where report_count < 3;
