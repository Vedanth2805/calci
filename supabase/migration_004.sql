-- ==============================================================================
-- CalciShare - Migration 004: Keep-Alive RPC Function & Deployment Hardening
-- Safe to run in Supabase SQL editor (idempotent: CREATE OR REPLACE, GRANT/REVOKE)
-- ==============================================================================

-- 1. Free-Tier Keep-Alive RPC Function
-- Supabase automatically pauses free-tier projects after 7 days of inactivity.
-- This function executes a lightweight count query on public.listings to generate
-- real database activity via PostgREST without leaking any row data or personal details.
-- It returns an integer (count of available, unexpired listings with < 3 reports).
-- Marked STABLE so PostgREST allows HTTP GET requests to /rest/v1/rpc/keepalive.

CREATE OR REPLACE FUNCTION public.keepalive()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_count integer;
BEGIN
  SELECT count(*)::integer
  INTO active_count
  FROM public.listings
  WHERE status = 'available'
    AND expires_at > now()
    AND report_count < 3;

  RETURN active_count;
END;
$$;

-- 2. Restrict Execution Permissions
-- Deny default public execution and grant EXECUTE exclusively to anon and authenticated roles.
REVOKE EXECUTE ON FUNCTION public.keepalive() FROM public;
GRANT EXECUTE ON FUNCTION public.keepalive() TO anon, authenticated;

-- ==============================================================================
-- Security Audit Verification Note (Migrations 001 - 003):
-- 1. Immutable columns (owner_id, report_count, created_at) are guarded in
--    public.guard_listing_update() and cannot be modified by users.
-- 2. Reverting status from 'done' -> 'available' is rejected in
--    public.guard_listing_update().
-- 3. Reports cannot be modified or deleted by users (no UPDATE/DELETE policies),
--    and listings with report_count >= 3 remain hidden from all non-owners.
-- 4. 5-available-listing limit is enforced on INSERT (check_user_listing_limit)
--    and UPDATE (check_user_listing_limit_on_update).
-- 5. Reviving an expired listing is capped at 31 days via guard_listing_update.
-- ==============================================================================
