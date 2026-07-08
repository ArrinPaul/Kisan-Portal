/**
 * @file job-store.ts
 * @description Supabase-based async job store for tracking long-running
 * Earth Engine computation jobs. Uses the `analysis_jobs` Postgres table.
 */
import 'server-only';
import { sql } from '@/lib/db';
import { logger } from '@/lib/logger';

const JOBS_TABLE = 'analysis_jobs';

export interface JobRecord {
    id: string;
    status: 'pending' | 'completed' | 'error';
    input: Record<string, unknown>;
    data?: Record<string, unknown> | null;
    error?: string | null;
    created_at: string;
    completed_at?: string | null;
    failed_at?: string | null;
}

/**
 * Creates a new job row with status='pending'.
 */
export async function createJob(jobId: string, input: Record<string, unknown>): Promise<void> {
    await sql`
        INSERT INTO ${sql(JOBS_TABLE)} (id, status, input, created_at)
        VALUES (${jobId}, 'pending', ${sql.json(input as any)}, NOW())
    `;
}

/**
 * Marks a job as completed with its result data.
 */
export async function completeJob(jobId: string, data: Record<string, unknown>): Promise<void> {
    await sql`
        UPDATE ${sql(JOBS_TABLE)}
        SET status = 'completed', data = ${sql.json(data as any)}, completed_at = NOW()
        WHERE id = ${jobId}
    `;
}

/**
 * Marks a job as errored with an error message.
 */
export async function failJob(jobId: string, errorMessage: string): Promise<void> {
    await sql`
        UPDATE ${sql(JOBS_TABLE)}
        SET status = 'error', error = ${errorMessage}, failed_at = NOW()
        WHERE id = ${jobId}
    `;
}

/**
 * Retrieves a job record by ID.
 */
export async function getJob(jobId: string): Promise<JobRecord | null> {
    try {
        const rows = await sql<JobRecord[]>`
            SELECT id, status, input, data, error, created_at, completed_at, failed_at
            FROM ${sql(JOBS_TABLE)}
            WHERE id = ${jobId}
            LIMIT 1
        `;
        return rows.length > 0 ? rows[0] : null;
    } catch (e) {
        logger.error('supabase_get_job_failed', {
            scope: 'lib.job-store',
            jobId,
            error: e instanceof Error ? e.message : String(e),
        });
        return null;
    }
}