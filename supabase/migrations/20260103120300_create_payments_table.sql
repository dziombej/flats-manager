-- Migration: Create payments table
-- Description: Stores generated monthly payment instances
-- Tables affected: payments
-- Special notes: Payments are immutable once paid; amount is copied from base_amount at generation

-- Create payments table
-- This table stores individual payment instances generated from payment_types
-- Each payment represents a specific month/year obligation
create table if not exists public.payments (
  -- Primary key using UUID for security and compatibility
  id uuid primary key default gen_random_uuid(),

  -- Foreign key to payment_types table
  -- Links payment to its template/type
  -- Cascade delete ensures payments are removed when payment type is deleted
  payment_type_id uuid not null references public.payment_types(id) on delete cascade,

  -- Payment amount in PLN
  -- Copied from payment_types.base_amount at generation time
  -- Remains unchanged even if base_amount is later modified (historical accuracy)
  -- Uses NUMERIC(10,2) for exact decimal precision (no floating-point errors)
  -- Max value: 99,999,999.99 PLN
  -- Must be non-negative (check constraint enforced)
  amount numeric(10,2) not null check (amount >= 0),

  -- Payment month (1-12)
  -- Combined with year, identifies the payment period
  -- Check constraint ensures valid month range
  month integer not null check (month >= 1 and month <= 12),

  -- Payment year
  -- Reasonable range to prevent data entry errors
  -- Check constraint ensures year is within realistic bounds
  year integer not null check (year >= 1900 and year <= 2100),

  -- Payment status flag
  -- false = unpaid (default), true = paid
  -- Once set to true, payment becomes immutable (enforced at application level)
  is_paid boolean not null default false,

  -- Timestamp when payment was marked as paid
  -- Must be set when is_paid = true (check constraint enforced)
  -- Can be null when is_paid = false
  -- Provides audit trail for payment transactions
  paid_at timestamp with time zone check (is_paid = false or paid_at is not null),

  -- Audit timestamps
  -- created_at tracks when the payment was generated
  created_at timestamp with time zone not null default now(),

  -- updated_at tracks last modification time
  -- Will be automatically updated via trigger
  updated_at timestamp with time zone not null default now(),

  -- Unique constraint prevents duplicate payments
  -- One payment per payment type per month/year
  -- Allows ON CONFLICT DO NOTHING for idempotent payment generation
  constraint unique_payment_per_period unique (payment_type_id, month, year)
);

-- Enable Row Level Security
-- Ensures users can only access payments for their own flats
alter table public.payments enable row level security;

-- Create performance indexes
-- Index on payment_type_id for efficient joins with payment_types table
-- Critical for payment lists and RLS policies
create index if not exists idx_payments_payment_type_id on public.payments(payment_type_id);

-- Index on is_paid for filtering unpaid payments
-- Critical for dashboard debt calculation
create index if not exists idx_payments_is_paid on public.payments(is_paid);

-- Composite index on month and year for time-based filtering
-- Critical for monthly payment views
create index if not exists idx_payments_month_year on public.payments(month, year);

-- Add comments for documentation
comment on table public.payments is 'Individual monthly payment instances';
comment on column public.payments.id is 'Unique payment identifier';
comment on column public.payments.payment_type_id is 'Associated payment type identifier';
comment on column public.payments.amount is 'Payment amount in PLN (copied from base_amount at generation)';
comment on column public.payments.month is 'Payment month (1-12)';
comment on column public.payments.year is 'Payment year';
comment on column public.payments.is_paid is 'Payment status (false=unpaid, true=paid)';
comment on column public.payments.paid_at is 'Timestamp when payment was marked as paid';
comment on column public.payments.created_at is 'Timestamp when payment was generated';
comment on column public.payments.updated_at is 'Timestamp of last payment update';

