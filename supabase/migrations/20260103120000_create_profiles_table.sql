-- Migration: Create profiles table
-- Description: Extends Supabase Auth (auth.users) with application-specific user data
-- Tables affected: profiles
-- Special notes: Profile is automatically created when user registers via Supabase Auth

-- Create profiles table
-- This table stores additional user information beyond what Supabase Auth provides
-- Each profile has a 1:1 relationship with auth.users
create table if not exists public.profiles (
  -- Primary key that references auth.users.id
  -- Uses UUID to match Supabase Auth user IDs
  id uuid primary key references auth.users(id) on delete cascade,

  -- User email duplicated from auth.users for convenience
  -- Avoids expensive joins with auth.users table
  email text not null,

  -- Audit timestamps
  -- created_at tracks when the profile was created
  created_at timestamp with time zone not null default now(),

  -- updated_at tracks last modification time
  -- Will be automatically updated via trigger
  updated_at timestamp with time zone not null default now()
);

-- Enable Row Level Security
-- This ensures users can only access their own profile data
alter table public.profiles enable row level security;

-- Create index for performance
-- Although id is the primary key, this explicit index can help with RLS queries
create index if not exists idx_profiles_id on public.profiles(id);

-- Add comments for documentation
comment on table public.profiles is 'User profiles extending Supabase Auth with application-specific data';
comment on column public.profiles.id is 'User identifier matching auth.users.id';
comment on column public.profiles.email is 'User email duplicated from auth.users for performance';
comment on column public.profiles.created_at is 'Timestamp when profile was created';
comment on column public.profiles.updated_at is 'Timestamp of last profile update';

