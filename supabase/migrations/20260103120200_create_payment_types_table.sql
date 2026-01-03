-- Migration: Create payment_types table
-- Description: Defines recurring payment templates for each flat
-- Tables affected: payment_types
-- Special notes: Each flat has 1:N payment types (e.g., Rent, Utilities)

-- Create payment_types table
-- This table stores templates for recurring payments
-- Examples: Monthly rent, utilities, administration fees
create table if not exists public.payment_types (
  -- Primary key using UUID for security and compatibility
  id uuid primary key default gen_random_uuid(),

  -- Foreign key to flats table
  -- Links payment type to a specific flat
  -- Cascade delete ensures payment types are removed when flat is deleted
  flat_id uuid not null references public.flats(id) on delete cascade,

  -- Payment type name
  -- Examples: "Czynsz" (Rent), "Media" (Utilities), "Administracja"
  -- No uniqueness constraint - duplicates allowed within flat in MVP
  name text not null,

  -- Base amount for this payment type in PLN
  -- This is the default/template amount copied to payments when generated
  -- Uses NUMERIC(10,2) for exact decimal precision (no floating-point errors)
  -- Max value: 99,999,999.99 PLN (sufficient for typical rent prices)
  -- Must be non-negative (check constraint enforced)
  base_amount numeric(10,2) not null check (base_amount >= 0),

  -- Audit timestamps
  -- created_at tracks when the payment type was created
  created_at timestamp with time zone not null default now(),

  -- updated_at tracks last modification time
  -- Will be automatically updated via trigger
  updated_at timestamp with time zone not null default now()
);

-- Enable Row Level Security
-- Ensures users can only access payment types for their own flats
alter table public.payment_types enable row level security;

-- Create performance indexes
-- Index on flat_id for efficient joins with flats table
-- Critical for payment generation and RLS policies
create index if not exists idx_payment_types_flat_id on public.payment_types(flat_id);

-- Add comments for documentation
comment on table public.payment_types is 'Recurring payment templates for flats';
comment on column public.payment_types.id is 'Unique payment type identifier';
comment on column public.payment_types.flat_id is 'Associated flat identifier';
comment on column public.payment_types.name is 'Payment type name (e.g., Rent, Utilities)';
comment on column public.payment_types.base_amount is 'Base payment amount in PLN (template for generated payments)';
comment on column public.payment_types.created_at is 'Timestamp when payment type was created';
comment on column public.payment_types.updated_at is 'Timestamp of last payment type update';

