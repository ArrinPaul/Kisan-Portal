import 'server-only';
import { sql } from '@/lib/db';

export type UserPreferences = {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  reducedMotion?: boolean;
};

export type UserHistoryItem = {
  id: string;
  createdAt: string;
  kind: 'dashboard' | 'chat';
  payload: Record<string, unknown>;
};

/**
 * Ensures that the User row exists in PostgreSQL before inserting preferences or relations.
 * In a real application, users are created at sign-up, but for compatibility we upsert.
 */
async function ensureUserExists(userId: string): Promise<void> {
  await sql`
    INSERT INTO users (id, email, password_hash, full_name)
    VALUES (${userId}, ${userId + '@kisan.internal'}, 'external_oauth_no_password', 'Kisan User')
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  await ensureUserExists(userId);
  const language = preferences.language ?? 'en';
  const theme = preferences.theme ?? 'light';
  await sql`
    INSERT INTO user_preferences (user_id, language, theme)
    VALUES (${userId}, ${language}, ${theme})
    ON CONFLICT (user_id) DO UPDATE
    SET language = EXCLUDED.language, theme = EXCLUDED.theme
  `;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const rows = await sql<any[]>`
    SELECT language, theme FROM user_preferences WHERE user_id = ${userId}
  `;
  if (rows.length === 0) {
    return null;
  }
  const pref = rows[0];
  return {
    language: pref.language,
    theme: pref.theme,
  };
}

export async function appendUserHistory(userId: string, item: UserHistoryItem): Promise<void> {
  await ensureUserExists(userId);

  if (item.kind === 'chat') {
    // Find most recent conversation
    const convoRows = await sql<any[]>`
      SELECT id FROM conversations WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1
    `;
    
    let conversationId: string;
    if (convoRows.length === 0) {
      const newConvo = await sql<any[]>`
        INSERT INTO conversations (user_id, title)
        VALUES (${userId}, 'Kisan Assistant Chat')
        RETURNING id
      `;
      conversationId = newConvo[0].id;
    } else {
      conversationId = convoRows[0].id;
    }

    const messages = (item.payload.messages as any[]) || [];
    if (messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg) {
        await sql`
          INSERT INTO messages (conversation_id, role, message, model)
          VALUES (${conversationId}, ${latestMsg.role || 'user'}, ${latestMsg.content || ''}, ${latestMsg.model || null})
        `;
      }
    }
  } else {
    // Store as audit log
    await sql`
      INSERT INTO audit_logs (user_id, action, entity_name, changes)
      VALUES (${userId}, 'DASHBOARD_INTERACTION', 'Dashboard', ${sql.json(item.payload as any)})
    `;
  }
}

export async function listUserHistory(userId: string, limit = 20): Promise<UserHistoryItem[]> {
  // Fetch audit logs
  const auditLogs = await sql<any[]>`
    SELECT id, created_at, changes FROM audit_logs
    WHERE user_id = ${userId} AND action = 'DASHBOARD_INTERACTION'
    ORDER BY created_at DESC LIMIT ${limit}
  `;

  // Fetch conversations with their messages grouped
  const convos = await sql<any[]>`
    SELECT c.id, c.title, c.created_at,
           json_agg(
             json_build_object(
               'role', m.role,
               'content', m.message,
               'model', m.model,
               'createdAt', m.created_at
             ) ORDER BY m.created_at ASC
           ) as messages
    FROM conversations c
    JOIN messages m ON m.conversation_id = c.id
    WHERE c.user_id = ${userId}
    GROUP BY c.id, c.title, c.created_at
    ORDER BY c.created_at DESC LIMIT ${limit}
  `;

  const historyItems: UserHistoryItem[] = [];

  for (const log of auditLogs) {
    historyItems.push({
      id: log.id,
      createdAt: log.created_at.toISOString(),
      kind: 'dashboard',
      payload: log.changes || {},
    });
  }

  for (const convo of convos) {
    historyItems.push({
      id: convo.id,
      createdAt: convo.created_at.toISOString(),
      kind: 'chat',
      payload: {
        conversationId: convo.id,
        title: convo.title,
        messages: convo.messages || [],
      },
    });
  }

  return historyItems
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
