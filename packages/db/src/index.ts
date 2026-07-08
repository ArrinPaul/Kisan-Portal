import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Lazy-initialized Supabase client — only created when first accessed
let _supabase: SupabaseClient | null = null;

/**
 * Supabase JS client for standard REST / Auth / Storage queries.
 * Uses HTTPS — works reliably in all environments including Vercel serverless.
 */
export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and ' +
      '(SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in your environment.'
    );
  }
  _supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
  return _supabase;
}

// Backwards-compatible named export (lazy getter)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getSupabase();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

// ---------------------------------------------------------------------------
// Raw PostgreSQL client — LAZY, only created on first call to getSql()
// ---------------------------------------------------------------------------

let _sql: ReturnType<typeof postgres> | null = null;

/**
 * Direct PostgreSQL client for raw SQL queries.
 * Uses port 5432 (direct connection).
 * Only connects when first called — avoids eager DNS/TCP failures at import time.
 */
export function getSql() {
  if (_sql) return _sql;
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!directUrl) {
    throw new Error(
      'Database URL missing. Set DIRECT_URL or DATABASE_URL in your environment.'
    );
  }
  _sql = postgres(directUrl, {
    ssl: directUrl.includes('supabase') ? 'require' : false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
  });
  return _sql;
}

/**
 * @deprecated Use getSql() instead. This eagerly connects and may fail at import time.
 * Keapped for backwards compatibility — returns a lazy proxy.
 */
export const sql = new Proxy({} as ReturnType<typeof postgres>, {
  get(_target, prop, _receiver) {
    const client = getSql();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});
