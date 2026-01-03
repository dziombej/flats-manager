-- Migration: Create flats table
-- Description: Stores apartment data managed by landlords
-- Tables affected: flats
-- Special notes: Each user can have multiple flats (1:N relationship)

-- Create flats table
-- This table stores information about apartments/flats managed by users
-- Each flat belongs to exactly one user
create table if not exists public.flats (
  -- Primary key using UUID for security and compatibility
  id uuid primary key default gen_random_uuid(),

  -- Foreign key to auth.users
  -- Identifies the owner/landlord of this flat
  -- Cascade delete ensures flats are removed when user is deleted
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Flat name for easy identification
  -- Examples: "Żoliborz 1", "Downtown Apartment"
  -- No uniqueness constraint - duplicates allowed in MVP
  name text not null,

  -- Physical address of the flat
  -- Examples: "ul. Słowackiego 1", "123 Main St"
  address text not null,

  -- Audit timestamps
  -- created_at tracks when the flat was added to the system
  created_at timestamp with time zone not null default now(),

  -- updated_at tracks last modification time
  -- Will be automatically updated via trigger
  updated_at timestamp with time zone not null default now()
);

-- Enable Row Level Security
-- Ensures users can only access their own flats
alter table public.flats enable row level security;

-- Create performance indexes
-- Index on user_id for efficient filtering by owner
-- Critical for dashboard queries and RLS policies
create index if not exists idx_flats_user_id on public.flats(user_id);

-- Add comments for documentation
comment on table public.flats is 'Apartments/flats managed by users';
comment on column public.flats.id is 'Unique flat identifier';
comment on column public.flats.user_id is 'Owner/landlord identifier';
comment on column public.flats.name is 'Flat name for easy identification';
comment on column public.flats.address is 'Physical address of the flat';
comment on column public.flats.created_at is 'Timestamp when flat was added';
comment on column public.flats.updated_at is 'Timestamp of last flat update';

