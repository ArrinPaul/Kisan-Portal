import 'server-only';
import { supabase } from '@/lib/db';

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
 * Ensures the user row exists before inserting preferences or relations.
 */
async function ensureUserExists(userId: string): Promise<void> {
  await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        email: `${userId}@kisan.internal`,
        password_hash: 'external_oauth_no_password',
        full_name: 'Kisan User',
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
}

export async function saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  await ensureUserExists(userId);
  const language = preferences.language ?? 'en';
  const theme = preferences.theme ?? 'light';

  await supabase
    .from('user_preferences')
    .upsert(
      { user_id: userId, language, theme },
      { onConflict: 'user_id' }
    );
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data } = await supabase
    .from('user_preferences')
    .select('language, theme')
    .eq('user_id', userId)
    .single();

  if (!data) return null;
  return { language: data.language, theme: data.theme };
}

export async function appendUserHistory(userId: string, item: UserHistoryItem): Promise<void> {
  await ensureUserExists(userId);

  if (item.kind === 'chat') {
    // Find or create the most recent conversation
    const { data: convoRows } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    let conversationId: string;

    if (!convoRows || convoRows.length === 0) {
      const { data: newConvo } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title: 'Kisan Assistant Chat' })
        .select('id')
        .single();
      conversationId = newConvo?.id;
    } else {
      conversationId = convoRows[0].id;
    }

    if (!conversationId) return;

    const messages = (item.payload.messages as any[]) || [];
    if (messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: latestMsg.role || 'user',
          message: latestMsg.content || '',
          model: latestMsg.model || null,
        });
      }
    }
  } else {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'DASHBOARD_INTERACTION',
      entity_name: 'Dashboard',
      changes: item.payload,
    });
  }
}

export async function listUserHistory(userId: string, limit = 20): Promise<UserHistoryItem[]> {
  // Fetch audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('id, created_at, changes')
    .eq('user_id', userId)
    .eq('action', 'DASHBOARD_INTERACTION')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Fetch conversations
  const { data: convos } = await supabase
    .from('conversations')
    .select('id, title, created_at, messages(role, message, model, created_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  const historyItems: UserHistoryItem[] = [];

  for (const log of auditLogs || []) {
    historyItems.push({
      id: log.id,
      createdAt: new Date(log.created_at).toISOString(),
      kind: 'dashboard',
      payload: log.changes || {},
    });
  }

  for (const convo of convos || []) {
    const msgs = ((convo as any).messages || []).map((m: any) => ({
      role: m.role,
      content: m.message,
      model: m.model,
      createdAt: m.created_at,
    }));
    historyItems.push({
      id: convo.id,
      createdAt: new Date(convo.created_at).toISOString(),
      kind: 'chat',
      payload: {
        conversationId: convo.id,
        title: convo.title,
        messages: msgs,
      },
    });
  }

  return historyItems
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
