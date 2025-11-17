import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { summaries } from '@/data/summaries';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedStories() {
  console.log('🌱 Seeding stories table...\n');

  for (const summary of summaries) {
    console.log(`📝 Upserting: ${summary.slug}`);

    const { data, error } = await supabase
      .from('stories')
      .upsert({
        slug: summary.slug,
        title_en: summary.title_en,
        body_en: summary.body_en,
      }, {
        onConflict: 'slug'
      });

    if (error) {
      console.error(`❌ Failed to upsert ${summary.slug}:`, error.message);
    } else {
      console.log(`✅ Upserted: ${summary.slug}`);
    }
  }

  // Verify the data
  console.log('\n📊 Verifying seeded data...');
  const { data: seededData, error: fetchError } = await supabase
    .from('stories')
    .select('slug, title_en, audio_url')
    .order('slug');

  if (fetchError) {
    console.error('❌ Failed to fetch stories:', fetchError.message);
  } else {
    console.log(`\n✅ Successfully seeded ${seededData?.length || 0} stories:`);
    seededData?.forEach(s => {
      console.log(`   - ${s.slug}: "${s.title_en}" (audio: ${s.audio_url ? '✓' : '✗'})`);
    });
  }
}

seedStories()
  .then(() => {
    console.log('\n✨ Seeding complete!');
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });