/**
 * @file job-store.ts
 * @description Supabase-based async job store for tracking long-running
 * Earth Engine computation jobs. Uses the Supabase JS client (HTTPS/REST)
 * which is reliable in all environments including Vercel serverless.
 */
import 'server-only';
import { supabase } from '@/lib/db';
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
    const { error } = await supabase
        .from(JOBS_TABLE)
        .insert({ id: jobId, status: 'pending', input });

    if (error) {
        logger.error('supabase_create_job_failed', {
            scope: 'lib.job-store', jobId, error: error.message,
        });
        throw new Error(`Failed to create job: ${error.message}`);
    }
}

/**
 * Marks a job as completed with its result data.
 */
export async function completeJob(jobId: string, data: Record<string, unknown>): Promise<void> {
    const { error } = await supabase
        .from(JOBS_TABLE)
        .update({ status: 'completed', data, completed_at: new Date().toISOString() })
        .eq('id', jobId);

    if (error) {
        logger.error('supabase_complete_job_failed', {
            scope: 'lib.job-store', jobId, error: error.message,
        });
    }
}

/**
 * Marks a job as errored with an error message.
 */
export async function failJob(jobId: string, errorMessage: string): Promise<void> {
    const { error } = await supabase
        .from(JOBS_TABLE)
        .update({ status: 'error', error: errorMessage, failed_at: new Date().toISOString() })
        .eq('id', jobId);

    if (error) {
        logger.error('supabase_fail_job_failed', {
            scope: 'lib.job-store', jobId, error: error.message,
        });
    }
}

/**
 * Retrieves a job record by ID.
 */
export async function getJob(jobId: string): Promise<JobRecord | null> {
    try {
        const { data, error } = await supabase
            .from(JOBS_TABLE)
            .select('id, status, input, data, error, created_at, completed_at, failed_at')
            .eq('id', jobId)
            .single();

        if (error || !data) return null;
        return data as JobRecord;
    } catch (e) {
        logger.error('supabase_get_job_failed', {
            scope: 'lib.job-store',
            jobId,
            error: e instanceof Error ? e.message : String(e),
        });
        return null;
    }
}