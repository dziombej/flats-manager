-- Migration: Seed initial test data
-- Description: Creates test users and sample flats with payment types
-- Tables affected: profiles, flats, payment_types
-- Special notes: Idempotent - can be run multiple times safely

-- Note: This migration assumes test users already exist in auth.users
-- Users should be created via Supabase Auth or manually before running this migration
-- Expected test users:
-- 1. admin@flatmanager.local (password: password123)
-- 2. test@flatmanager.local (password: password123)

-- The actual user creation should be done through Supabase Auth Dashboard or API
-- This migration only creates profiles and related data

-- Variables for user IDs (replace with actual UUIDs from auth.users)
-- These should match the IDs created in Supabase Auth
-- For development, you may need to update these UUIDs after user creation

-- Seed Profile for User 1: admin@flatmanager.local
-- This profile extends the auth.users record with application-specific data
-- Uses ON CONFLICT to make this migration idempotent
insert into public.profiles (id, email)
select
  id,
  email
from auth.users
where email = 'admin@flatmanager.local'
on conflict (id) do update
set email = excluded.email;

-- Seed Profile for User 2: test@flatmanager.local
-- This user will have no flats (empty dashboard for testing)
-- Uses ON CONFLICT to make this migration idempotent
insert into public.profiles (id, email)
select
  id,
  email
from auth.users
where email = 'test@flatmanager.local'
on conflict (id) do update
set email = excluded.email;

-- Seed Flats and Payment Types for User 1 (admin@flatmanager.local)
-- Only insert if user exists in auth.users

-- Flat 1: Cynarka
-- Insert flat only if it doesn't already exist for this user
-- Uses a DO block to handle conditional insertion
do $$
declare
  v_user_id uuid;
  v_flat_id uuid;
begin
  -- Get user ID for admin@flatmanager.local
  select id into v_user_id
  from auth.users
  where email = 'admin@flatmanager.local';

  -- Only proceed if user exists
  if v_user_id is not null then
    -- Insert or get existing flat
    insert into public.flats (user_id, name, address)
    values (v_user_id, 'Cynarka', 'ul. Cynarskiego 5')
    on conflict on constraint flats_pkey do nothing
    returning id into v_flat_id;

    -- If flat was not inserted (already exists), get its ID
    if v_flat_id is null then
      select id into v_flat_id
      from public.flats
      where user_id = v_user_id
      and name = 'Cynarka'
      limit 1;
    end if;

    -- Insert payment types for Żoliborz 1
    -- Czynsz (Rent): 1000.00 PLN
    insert into public.payment_types (flat_id, name, base_amount)
    values (v_flat_id, 'Czynsz', 1000.00)
    on conflict on constraint payment_types_pkey do nothing;

    -- Administracja (Administration): 200.00 PLN
    insert into public.payment_types (flat_id, name, base_amount)
    values (v_flat_id, 'Administracja', 200.00)
    on conflict on constraint payment_types_pkey do nothing;
  end if;
end $$;

-- Flat 2: Świeteź
do $$
declare
  v_user_id uuid;
  v_flat_id uuid;
begin
  -- Get user ID for admin@flatmanager.local
  select id into v_user_id
  from auth.users
  where email = 'admin@flatmanager.local';

  -- Only proceed if user exists
  if v_user_id is not null then
    -- Insert or get existing flat
    insert into public.flats (user_id, name, address)
    values (v_user_id, 'Świeteź', 'ul. Świtezianki 54A')
    on conflict on constraint flats_pkey do nothing
    returning id into v_flat_id;

    -- If flat was not inserted (already exists), get its ID
    if v_flat_id is null then
      select id into v_flat_id
      from public.flats
      where user_id = v_user_id
      and name = 'Świteź'
      limit 1;
    end if;

    -- Insert payment types for Mokotów 2
    -- Czynsz (Rent): 1500.00 PLN
    insert into public.payment_types (flat_id, name, base_amount)
    values (v_flat_id, 'Czynsz', 1500.00)
    on conflict on constraint payment_types_pkey do nothing;
  end if;
end $$;

-- Flat 3: Praga 3
do $$
declare
  v_user_id uuid;
  v_flat_id uuid;
begin
  -- Get user ID for admin@flatmanager.local
  select id into v_user_id
  from auth.users
  where email = 'admin@flatmanager.local';

  -- Only proceed if user exists
  if v_user_id is not null then
    -- Insert or get existing flat
    insert into public.flats (user_id, name, address)
    values (v_user_id, 'Praga 3', 'ul. Targowa 3')
    on conflict on constraint flats_pkey do nothing
    returning id into v_flat_id;

    -- If flat was not inserted (already exists), get its ID
    if v_flat_id is null then
      select id into v_flat_id
      from public.flats
      where user_id = v_user_id
      and name = 'Praga 3'
      limit 1;
    end if;

    -- Insert payment types for Praga 3
    -- Czynsz (Rent): 800.00 PLN
    insert into public.payment_types (flat_id, name, base_amount)
    values (v_flat_id, 'Czynsz', 800.00)
    on conflict on constraint payment_types_pkey do nothing;

    -- Media (Utilities): 150.00 PLN
    insert into public.payment_types (flat_id, name, base_amount)
    values (v_flat_id, 'Media', 150.00)
    on conflict on constraint payment_types_pkey do nothing;
  end if;
end $$;

-- Note: User 2 (test@flatmanager.local) intentionally has no flats
-- This provides an empty dashboard for testing the empty state UI

