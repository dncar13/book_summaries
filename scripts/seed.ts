import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { summaries } from '../data/summaries';
import type { Database } from '../lib/types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  if (!url || !anonKey) {
    console.error('Supabase env vars missing');
    process.exit(1);
  }

  const client = createClient<Database>(url, anonKey);
  const payload = summaries.map(({ cover_seed, ...rest }) => rest);
  const { error } = await (client as any).from('summaries').upsert(payload, { onConflict: 'slug' });
  if (error) {
    console.error('Failed to seed summaries', error);
    process.exit(1);
  }
  console.log('Seed completed');
}

main();
