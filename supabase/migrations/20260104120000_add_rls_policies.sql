-- Migration: Add RLS policies for all tables
-- Description: Creates Row Level Security policies to allow authenticated users to access their own data
-- Tables affected: profiles, flats, payment_types, payments
-- Special notes: Without these policies, RLS blocks all access even though tables have RLS enabled

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own profile
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- ============================================================================
-- FLATS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own flats
create policy "Users can view their own flats"
  on public.flats
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own flats
create policy "Users can insert their own flats"
  on public.flats
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own flats
create policy "Users can update their own flats"
  on public.flats
  for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own flats
create policy "Users can delete their own flats"
  on public.flats
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- PAYMENT_TYPES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view payment types for their own flats
create policy "Users can view payment types for their own flats"
  on public.payment_types
  for select
  using (
    exists (
      select 1 from public.flats
      where flats.id = payment_types.flat_id
      and flats.user_id = auth.uid()
    )
  );

-- Policy: Users can insert payment types for their own flats
create policy "Users can insert payment types for their own flats"
  on public.payment_types
  for insert
  with check (
    exists (
      select 1 from public.flats
      where flats.id = payment_types.flat_id
      and flats.user_id = auth.uid()
    )
  );

-- Policy: Users can update payment types for their own flats
create policy "Users can update payment types for their own flats"
  on public.payment_types
  for update
  using (
    exists (
      select 1 from public.flats
      where flats.id = payment_types.flat_id
      and flats.user_id = auth.uid()
    )
  );

-- Policy: Users can delete payment types for their own flats
create policy "Users can delete payment types for their own flats"
  on public.payment_types
  for delete
  using (
    exists (
      select 1 from public.flats
      where flats.id = payment_types.flat_id
      and flats.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view payments for their own flats
create policy "Users can view payments for their own flats"
  on public.payments
  for select
  using (
    exists (
      select 1 from public.payment_types
      join public.flats on flats.id = payment_types.flat_id
      where payment_types.id = payments.payment_type_id
      and flats.user_id = auth.uid()
    )
  );

-- Policy: Users can insert payments for their own flats
create policy "Users can insert payments for their own flats"
  on public.payments
  for insert
  with check (
    exists (
      select 1 from public.payment_types
      join public.flats on flats.id = payment_types.flat_id
      where payment_types.id = payments.payment_type_id
      and flats.user_id = auth.uid()
    )
  );

-- Policy: Users can update payments for their own flats
create policy "Users can update payments for their own flats"
  on public.payments
  for update
  using (
    exists (
      select 1 from public.payment_types
      join public.flats on flats.id = payment_types.flat_id
      where payment_types.id = payments.payment_type_id
      and flats.user_id = auth.uid()
    )
  );

-- Policy: Users can delete payments for their own flats
create policy "Users can delete payments for their own flats"
  on public.payments
  for delete
  using (
    exists (
      select 1 from public.payment_types
      join public.flats on flats.id = payment_types.flat_id
      where payment_types.id = payments.payment_type_id
      and flats.user_id = auth.uid()
    )
  );

-- Add comments for documentation
comment on policy "Users can view their own profile" on public.profiles is 'Allows authenticated users to read their own profile data';
comment on policy "Users can view their own flats" on public.flats is 'Allows authenticated users to read their own flats';
comment on policy "Users can view payment types for their own flats" on public.payment_types is 'Allows authenticated users to read payment types for their flats';
comment on policy "Users can view payments for their own flats" on public.payments is 'Allows authenticated users to read payments for their flats';

