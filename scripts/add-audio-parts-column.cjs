require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Adding audio_parts column to stories table...');
console.log('\n📋 Run this SQL in Supabase Dashboard:');
console.log('https://llyunioulzfbgqvmeaxq.supabase.co/project/llyunioulzfbgqvmeaxq/sql\n');
console.log('=' .repeat(60));
console.log(`
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS audio_parts jsonb;

-- Also add to summaries if missing
ALTER TABLE public.summaries
ADD COLUMN IF NOT EXISTS audio_parts jsonb;
`);
console.log('=' .repeat(60));
console.log('\n✅ After running this SQL, the audio generation will work.');