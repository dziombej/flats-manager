import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

