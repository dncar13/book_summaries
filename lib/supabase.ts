import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cachedClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (!url || !anonKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: false
      }
    });
  }

  return cachedClient;
}
