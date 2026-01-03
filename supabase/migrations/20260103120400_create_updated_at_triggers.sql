-- Migration: Create updated_at trigger function and apply to all tables
-- Description: Automatically updates updated_at column on record modification
-- Tables affected: profiles, flats, payment_types, payments
-- Special notes: Uses PostgreSQL trigger function for automatic timestamp updates

-- Create trigger function for automatic updated_at updates
-- This function is called BEFORE UPDATE on any table with an updated_at column
-- It automatically sets updated_at to the current timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  -- Set the updated_at column to current timestamp
  -- This ensures every update is tracked with accurate timing
  new.updated_at = now();
  return new;
end;
$$;

-- Add comment for documentation
comment on function public.update_updated_at_column() is 'Trigger function to automatically update updated_at timestamp';

-- Create trigger for profiles table
-- Fires before any UPDATE operation to set updated_at timestamp
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- Create trigger for flats table
-- Fires before any UPDATE operation to set updated_at timestamp
create trigger update_flats_updated_at
  before update on public.flats
  for each row
  execute function public.update_updated_at_column();

-- Create trigger for payment_types table
-- Fires before any UPDATE operation to set updated_at timestamp
create trigger update_payment_types_updated_at
  before update on public.payment_types
  for each row
  execute function public.update_updated_at_column();

-- Create trigger for payments table
-- Fires before any UPDATE operation to set updated_at timestamp
-- Important: This tracks when payment status changes (e.g., marked as paid)
create trigger update_payments_updated_at
  before update on public.payments
  for each row
  execute function public.update_updated_at_column();

