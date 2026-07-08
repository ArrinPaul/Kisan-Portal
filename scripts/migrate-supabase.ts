/**
 * migrate-supabase.ts
 * Run this script once to create the analysis_jobs table in your Supabase database.
 * Usage: npx tsx scripts/migrate-supabase.ts
 */
import { config } from 'dotenv';
config({ path: '.env' });

import postgres from 'postgres';

// Use DIRECT_URL for migrations (port 5432 direct connection, not pooled)
const DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌  DIRECT_URL or DATABASE_URL is not set in .env');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
  connect_timeout: 15,
});

async function migrate() {
  console.log('🔄  Connecting to Supabase...');

  try {
    // Create analysis_jobs table
    await sql`
      CREATE TABLE IF NOT EXISTS analysis_jobs (
        id          VARCHAR(100) PRIMARY KEY,
        status      VARCHAR(50)  NOT NULL DEFAULT 'pending',
        input       JSONB        NOT NULL,
        data        JSONB,
        error       TEXT,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE,
        failed_at   TIMESTAMP WITH TIME ZONE
      )
    `;
    console.log('✅  Table analysis_jobs created (or already exists).');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status  ON analysis_jobs(status)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created ON analysis_jobs(created_at DESC)
    `;
    console.log('✅  Indexes created.');

    // Verify connection and table
    const rows = await sql`SELECT COUNT(*) AS cnt FROM analysis_jobs`;
    console.log(`✅  Verified: analysis_jobs has ${rows[0].cnt} rows.`);

    console.log('\n🎉  Migration complete! Firebase → Supabase migration is done.');
    console.log('   You can now remove GOOGLE_APPLICATION_CREDENTIALS_JSON from Vercel');
    console.log('   env vars if you only need it for Earth Engine (GEE), not for DB.');
  } catch (err) {
    console.error('❌  Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
