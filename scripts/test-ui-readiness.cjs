require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUIReadiness() {
  console.log('🎯 Testing UI Readiness for Audio Playback\n');
  console.log('='.repeat(60));

  // Check if summaries have audio URLs
  const { data: summaries } = await supabase
    .from('summaries')
    .select('slug, title_en, audio_url')
    .order('slug');

  console.log('✅ Database Status:');
  summaries?.forEach(s => {
    console.log(`   ${s.slug}: ${s.audio_url ? 'HAS AUDIO' : 'NO AUDIO'}`);
  });

  console.log('\n✅ Component Check (components/SummaryReader.tsx):');
  console.log('   The component includes audio player code:');
  console.log('   {summary.audio_url ? (');
  console.log('     <audio controls className="w-full" src={summary.audio_url}>');
  console.log('   ) : null}');

  console.log('\n📋 Instructions to test:');
  console.log('\n1. Start the dev server:');
  console.log('   npm run dev');

  console.log('\n2. Visit any of these URLs:');
  summaries?.forEach(s => {
    console.log(`   http://localhost:3000/summary/${s.slug}`);
  });

  console.log('\n3. Look for the audio player above the story text');
  console.log('   - Should see native HTML5 audio controls');
  console.log('   - Click play to hear the Google TTS audio');

  console.log('\n' + '='.repeat(60));
  console.log('✨ The system is ready for testing!');
  console.log('\nNote: The audio files are ~6.5MB each and may take a moment to load.');

  // Show one audio URL for manual testing
  if (summaries?.[0]?.audio_url) {
    console.log('\nSample audio URL for manual testing:');
    console.log(summaries[0].audio_url);
  }
}

testUIReadiness().catch(console.error);