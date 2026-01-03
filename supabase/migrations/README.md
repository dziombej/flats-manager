# Database Migrations

This directory contains PostgreSQL migrations for the flats-manager application, managed by Supabase CLI.

## Migration Files

Migrations are executed in chronological order based on their timestamps:

1. **20260103120000_create_profiles_table.sql** - Creates profiles table extending Supabase Auth
2. **20260103120100_create_flats_table.sql** - Creates flats table for apartment data
3. **20260103120200_create_payment_types_table.sql** - Creates payment types (recurring payment templates)
4. **20260103120300_create_payments_table.sql** - Creates payments table (monthly payment instances)
5. **20260103120400_create_updated_at_triggers.sql** - Creates triggers for automatic timestamp updates
6. **20260103120500_seed_test_data.sql** - Seeds test data for development

## Running Migrations

### Local Development

```bash
# Start local Supabase instance
supabase start

# Apply all pending migrations
supabase db push

# Reset database (WARNING: destroys all data)
supabase db reset
```

### Production

```bash
# Link to production project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Test Credentials

The seed migration creates two test users. You must first create these users in Supabase Auth:

### User 1: Admin (with sample data)
- **Email:** admin@flatmanager.local
- **Password:** password123
- **Data:** 3 flats with payment types

### User 2: Test (empty state)
- **Email:** test@flatmanager.local
- **Password:** password123
- **Data:** No flats (for testing empty dashboard)

## Creating Test Users

Before running migrations, create test users using Supabase Auth:

### Option 1: Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password for each test user
4. Confirm email (disable email confirmation in development)

### Option 2: SQL (after enabling Auth)
```sql
-- This requires appropriate Auth permissions
-- Better to use Supabase Dashboard or API
```

### Option 3: API Call
```bash
# Sign up user 1
curl -X POST 'http://localhost:54321/auth/v1/signup' \
  -H 'apikey: your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@flatmanager.local",
    "password": "password123"
  }'

# Sign up user 2
curl -X POST 'http://localhost:54321/auth/v1/signup' \
  -H 'apikey: your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@flatmanager.local",
    "password": "password123"
  }'
```

## Schema Overview

```
auth.users (Supabase Auth)
    ↓ 1:1
public.profiles
    
auth.users
    ↓ 1:N
public.flats
    ↓ 1:N
public.payment_types
    ↓ 1:N
public.payments
```

## Generating TypeScript Types

After running migrations, generate TypeScript types for type-safe database access:

```bash
# Generate types for local database
supabase gen types typescript --local > src/db/database.types.ts

# Generate types for production database
supabase gen types typescript --linked > src/db/database.types.ts
```

## Security

All tables have Row Level Security (RLS) enabled. Users can only access their own data:

- **profiles:** Users can only read/update their own profile
- **flats:** Users can only manage their own flats
- **payment_types:** Users can only manage payment types for their flats
- **payments:** Users can only manage payments for their flats

## Troubleshooting

### Migration fails with "relation already exists"
- Migrations are idempotent where possible, but some operations may fail on re-run
- Use `supabase db reset` to start fresh in development

### Seed data doesn't appear
- Ensure test users exist in `auth.users` before running seed migration
- Check that emails match exactly: `admin@flatmanager.local` and `test@flatmanager.local`

### RLS policies blocking queries
- Ensure you're using authenticated Supabase client
- Verify `auth.uid()` returns the expected user ID
- Check that foreign key relationships are correct

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Project Database Plan](../../.ai/db-plan.md)

