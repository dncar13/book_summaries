import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedServiceClient: SupabaseClient<Database> | null = null;

export function getServiceSupabaseClient() {
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase service role env vars are missing');
  }

  if (!cachedServiceClient) {
    cachedServiceClient = createClient<Database>(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return cachedServiceClient;
}
