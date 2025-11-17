'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database, EventType } from './types';
import { ensureSessionId } from './session';

let cachedClient: SupabaseClient<Database> | null = null;

function getClient() {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  cachedClient = createClient<Database>(url, anonKey, {
    auth: { persistSession: false }
  });
  return cachedClient;
}

export async function logEvent(eventType: EventType, summarySlug?: string) {
  const client = getClient();
  if (!client) return;
  const sessionId = ensureSessionId();
  if (!sessionId) return;
  try {
    await (client as any).from('events').insert({
      event_type: eventType,
      summary_slug: summarySlug ?? null,
      client_session_id: sessionId
    });
  } catch (error) {
    // Silently fail if events table doesn't exist yet
    if (process.env.NODE_ENV === 'development') {
      console.warn('Events logging skipped (table may not exist):', error);
    }
  }
}
