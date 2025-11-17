import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { summaries } from '@/data/summaries';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedSummaries() {
  console.log('🌱 Seeding summaries table...\n');

  for (const summary of summaries) {
    console.log(`📝 Upserting: ${summary.slug}`);

    const { data, error } = await supabase
      .from('summaries')
      .upsert({
        slug: summary.slug,
        title_en: summary.title_en,
        author_en: summary.author_en,
        minutes_estimated: summary.minutes_estimated,
        category_he: summary.category_he,
        cover_svg: summary.cover_svg,
        tldr_he: summary.tldr_he,
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
    .from('summaries')
    .select('slug, title_en, audio_url')
    .order('slug');

  if (fetchError) {
    console.error('❌ Failed to fetch summaries:', fetchError.message);
  } else {
    console.log(`\n✅ Successfully seeded ${seededData?.length || 0} summaries:`);
    seededData?.forEach(s => {
      console.log(`   - ${s.slug}: "${s.title_en}" (audio: ${s.audio_url ? '✓' : '✗'})`);
    });
  }
}

seedSummaries()
  .then(() => {
    console.log('\n✨ Seeding complete!');
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });