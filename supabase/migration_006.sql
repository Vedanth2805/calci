-- Migration 006: Multi-channel contact support (WhatsApp, Phone, VVCE Email, Telegram, Instagram, Discord)

-- 1. Expand contact_type check constraint for primary contact fallback
alter table public.listings
  drop constraint if exists listings_contact_type_check;

alter table public.listings
  add constraint listings_contact_type_check
  check (contact_type in ('whatsapp', 'phone', 'email', 'telegram', 'instagram', 'discord'));

-- 2. Add contacts jsonb column to store 1 or more contact methods
alter table public.listings
  add column if not exists contacts jsonb not null default '{}'::jsonb;

alter table public.listings
  drop constraint if exists check_contacts_non_empty;

alter table public.listings
  add constraint check_contacts_non_empty
  check (jsonb_typeof(contacts) = 'object');

-- 3. Backfill existing rows from contact_type + contact_handle
update public.listings
set contacts = jsonb_build_object(contact_type, contact_handle)
where contacts = '{}'::jsonb
  and contact_type is not null
  and contact_handle is not null;
