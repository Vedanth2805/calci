-- ==============================================================================
-- CalciShare - Migration 003: Security Hardening
-- Run this in the Supabase SQL Editor AFTER schema.sql and migration_002.sql
-- Safe to re-run (uses CREATE OR REPLACE, DROP … IF EXISTS, etc.)
-- ==============================================================================

-- ============================================================
-- FIX #1 (HIGH): Guard trigger — prevent listing owners from
-- modifying protected columns (report_count, owner_id,
-- created_at) or reverting status from done → available.
-- Cap expires_at at 31 days from now.
--
-- The guard only fires when auth.uid() = OLD.owner_id, so
-- SECURITY DEFINER triggers (e.g. report_count increment from
-- handle_new_report) are NOT blocked.
-- ============================================================
CREATE OR REPLACE FUNCTION public.guard_listing_update()
RETURNS trigger AS $$
BEGIN
  -- Only enforce when the caller is the listing owner.
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.owner_id THEN

    -- owner_id is immutable
    IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
      RAISE EXCEPTION 'Cannot change listing owner.';
    END IF;

    -- report_count is system-managed (triggers only)
    IF NEW.report_count IS DISTINCT FROM OLD.report_count THEN
      RAISE EXCEPTION 'Cannot modify report count.';
    END IF;

    -- created_at is immutable
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Cannot modify creation timestamp.';
    END IF;

    -- status: only allow available → done, never back
    IF OLD.status = 'done' AND NEW.status <> 'done' THEN
      RAISE EXCEPTION 'Cannot revert a completed listing back to available.';
    END IF;

    -- expires_at: silently cap at 31 days from now
    IF NEW.expires_at > now() + interval '31 days' THEN
      NEW.expires_at := now() + interval '31 days';
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_listing_update_guard ON public.listings;
CREATE TRIGGER on_listing_update_guard
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.guard_listing_update();


-- ============================================================
-- FIX #2 (HIGH): Enforce 5-listing limit on UPDATE when status
-- changes back to 'available' (the INSERT trigger already
-- exists in migration_002, this closes the UPDATE loophole).
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_user_listing_limit_on_update()
RETURNS trigger AS $$
DECLARE
  active_count int;
BEGIN
  -- Only check when status changes TO 'available' from something else
  IF NEW.status = 'available' AND OLD.status <> 'available' THEN
    SELECT count(*)
    INTO active_count
    FROM public.listings
    WHERE owner_id = NEW.owner_id
      AND status = 'available'
      AND id <> NEW.id;  -- exclude the row being updated

    IF active_count >= 5 THEN
      RAISE EXCEPTION 'Listing limit reached: A user may have at most 5 available listings at once.'
        USING errcode = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_listing_update_check_limit ON public.listings;
CREATE TRIGGER on_listing_update_check_limit
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.check_user_listing_limit_on_update();


-- ============================================================
-- FIX #3 (MEDIUM): contact_handle format constraint — block
-- path-traversal and special characters.  NOT VALID means
-- existing rows are not scanned (safe for live tables).
-- ============================================================
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS check_contact_handle_format;
ALTER TABLE public.listings ADD CONSTRAINT check_contact_handle_format
  CHECK (contact_handle ~ '^[a-zA-Z0-9._-]{2,50}$') NOT VALID;


-- ============================================================
-- FIX #12 (LOW): calculator_model length constraint.
-- ============================================================
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS check_calculator_model_length;
ALTER TABLE public.listings ADD CONSTRAINT check_calculator_model_length
  CHECK (char_length(calculator_model) BETWEEN 2 AND 50) NOT VALID;


-- ============================================================
-- FIX #7 (LOW): Tighten email domain check to exact domain
-- match (rejects hypothetical sub-domains like @x.vvce.ac.in).
-- CREATE OR REPLACE safely overwrites the existing function.
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_user_email_domain()
RETURNS trigger AS $$
BEGIN
  IF new.email IS NULL
     OR split_part(lower(trim(new.email)), '@', 2) <> 'vvce.ac.in' THEN
    RAISE EXCEPTION 'Access denied: Only @vvce.ac.in email addresses are permitted.';
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
