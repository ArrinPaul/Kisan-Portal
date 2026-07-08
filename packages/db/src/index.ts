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

const databaseUrl = process.env.DATABASE_URL;

// Direct PostgreSQL client for raw SQL / PostGIS queries
export const sql = postgres(databaseUrl || '', {
  ssl: databaseUrl?.includes('supabase') ? 'require' : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
