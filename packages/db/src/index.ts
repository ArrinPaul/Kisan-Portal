import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided in environment variables.');
}

// Supabase client for standard REST / Auth / Storage queries
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Use DIRECT_URL (port 5432) for raw SQL — works reliably in serverless & local environments.
// DATABASE_URL (port 6543, pgbouncer) is reserved for ORMs like Prisma that need it.
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl) {
  throw new Error('DIRECT_URL (or DATABASE_URL) must be provided in environment variables.');
}

// Direct PostgreSQL client for raw SQL queries
export const sql = postgres(directUrl, {
  ssl: directUrl.includes('supabase') ? 'require' : false,
  max: 5,
  idle_timeout: 20,
  connect_timeout: 15,
});
