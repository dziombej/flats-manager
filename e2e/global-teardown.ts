import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';

/**
 * Global teardown function that runs after all tests
 * Cleans up test data from the Supabase database
 */
async function globalTeardown() {
  console.log('🧹 Starting global teardown - cleaning up test data...');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;
  const testUserEmail = process.env.E2E_USERNAME;
  const testUserPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing required environment variables for Supabase connection');
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  // Create Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  });

  // Check if the key is actually a service role key (should start with 'eyJ')
  // If not, we need to authenticate as the test user to bypass RLS
  const isServiceRoleKey = supabaseServiceRoleKey.startsWith('eyJ');

  if (!isServiceRoleKey) {
    console.warn('⚠️  Provided key appears to be a publishable key, not a service role key');
    console.warn('⚠️  Attempting to authenticate as test user to delete flats...');

    if (!testUserEmail || !testUserPassword) {
      console.error('❌ Missing E2E_USERNAME or E2E_PASSWORD for authentication');
      throw new Error('Cannot proceed without service role key or test user credentials');
    }

    // Authenticate as test user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    });

    if (authError || !authData.session) {
      console.error('❌ Failed to authenticate as test user:', authError);
      throw new Error('Authentication failed');
    }

    console.log('✅ Authenticated as test user for cleanup');
  } else {
    console.log('✅ Using service role key (bypasses RLS)');
  }

  try {
    let totalDeleted = 0;

    // Option 1: Delete flats for specific test user (safer approach)
    if (testUserId) {
      console.log(`🎯 Deleting flats for test user: ${testUserId}`);

      // First, check how many flats exist for this user
      const { data: existingFlats, error: countError } = await supabase
        .from('flats')
        .select('id, name, user_id')
        .eq('user_id', testUserId);

      if (countError) {
        console.error('❌ Error counting flats:', countError);
      } else {
        console.log(`📊 Found ${existingFlats?.length ?? 0} flats for user ${testUserId}`);
      }

      // Now delete the flats
      const { error: flatsError, count } = await supabase
        .from('flats')
        .delete({ count: 'exact' })
        .eq('user_id', testUserId);

      if (flatsError) {
        console.error('❌ Error deleting flats:', flatsError);
        throw flatsError;
      }

      totalDeleted = count ?? 0;
      console.log(`✅ Successfully deleted ${totalDeleted} flats for test user`);
    } else {
      // Option 2: Delete all flats (use with caution - only for test environments)
      console.log('⚠️  No test user ID found, deleting ALL flats from database');
      const { error: flatsError, count } = await supabase
        .from('flats')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy record

      if (flatsError) {
        console.error('❌ Error deleting flats:', flatsError);
        throw flatsError;
      }

      totalDeleted = count ?? 0;
      console.log(`✅ Successfully deleted ${totalDeleted} flats from the database`);
    }

    // Note: Related payment_types and payments will be automatically deleted
    // due to CASCADE foreign key constraints in the database schema

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw - allow tests to complete even if cleanup fails
    // This prevents blocking CI/CD pipelines
    console.warn('⚠️  Continuing despite cleanup failure');
  }
}

export default globalTeardown;

