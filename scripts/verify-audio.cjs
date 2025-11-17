require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAudio() {
  console.log('🔍 Verifying audio URLs in database...\n');

  // Check summaries table
  console.log('📊 SUMMARIES TABLE:');
  const { data: summaries, error: sumError } = await supabase
    .from('summaries')
    .select('slug, title_en, audio_url')
    .order('slug');

  if (sumError) {
    console.error('❌ Error fetching summaries:', sumError.message);
  } else {
    summaries?.forEach(s => {
      const status = s.audio_url ? '✅' : '❌';
      console.log(`  ${status} ${s.slug}: "${s.title_en}"`);
      if (s.audio_url) {
        console.log(`     └─ ${s.audio_url}`);
      }
    });
  }

  console.log('\n📊 STORIES TABLE:');
  const { data: stories, error: storyError } = await supabase
    .from('stories')
    .select('slug, title_en, audio_url')
    .order('slug');

  if (storyError) {
    console.error('❌ Error fetching stories:', storyError.message);
  } else {
    stories?.forEach(s => {
      const status = s.audio_url ? '✅' : '❌';
      console.log(`  ${status} ${s.slug}: "${s.title_en}"`);
      if (s.audio_url) {
        console.log(`     └─ ${s.audio_url}`);
      }
    });
  }

  // Test if audio files are accessible
  console.log('\n🎵 Testing audio file accessibility:');
  const testUrl = stories?.[0]?.audio_url;
  if (testUrl) {
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('  ✅ Audio files are publicly accessible');
        console.log(`     Content-Type: ${response.headers.get('content-type')}`);
        console.log(`     Content-Length: ${response.headers.get('content-length')} bytes`);
      } else {
        console.log('  ❌ Audio files not accessible:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('  ⚠️ Could not test accessibility:', error.message);
    }
  }

  // Summary
  console.log('\n📋 SUMMARY:');
  const audioCount = stories?.filter(s => s.audio_url).length || 0;
  const totalCount = stories?.length || 0;
  console.log(`  ${audioCount}/${totalCount} stories have audio`);

  if (audioCount === totalCount && totalCount > 0) {
    console.log('\n✨ All stories have audio! The system is ready.');
  } else {
    console.log('\n⚠️ Some stories are missing audio. Run the generation script.');
  }
}

verifyAudio().catch(console.error);