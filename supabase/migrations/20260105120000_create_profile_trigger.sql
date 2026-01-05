-- Migration: Create trigger to auto-create profiles on user signup
-- Description: Automatically creates a profile record when a new user registers via Supabase Auth
-- Tables affected: profiles
-- Special notes: This trigger ensures every auth.users record has a corresponding profiles record

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert a new profile record for the newly created auth user
  insert into public.profiles (id, email, created_at, updated_at)
  values (
    new.id,
    new.email,
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger that fires after a new user is inserted into auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Add comment for documentation
comment on function public.handle_new_user() is 'Automatically creates a profile when a new user signs up';

