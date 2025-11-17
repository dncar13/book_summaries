import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { textToSpeech } from '@/lib/tts/text-to-speech';
import { summaries } from '@/data/summaries';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateAudioForAllStories() {
  console.log('🎧 Generating audio for all stories...\n');

  for (const summary of summaries) {
    console.log(`🎙️ Processing: ${summary.slug}`);

    try {
      // Generate audio
      const filename = `${summary.slug}.mp3`;
      const { audioUrl, provider, bytes } = await textToSpeech(summary.body_en, filename);

      console.log(`   ✅ Generated: ${bytes} bytes via ${provider}`);
      console.log(`   📁 URL: ${audioUrl}`);

      // Update stories table
      const { error: storiesError } = await supabase
        .from('stories')
        .update({ audio_url: audioUrl })
        .eq('slug', summary.slug);

      if (storiesError) {
        console.log(`   ⚠️ Failed to update stories.audio_url: ${storiesError.message}`);
      } else {
        console.log(`   ✅ Updated stories.audio_url`);
      }

      // Update summaries table
      const { error: summariesError } = await supabase
        .from('summaries')
        .update({ audio_url: audioUrl })
        .eq('slug', summary.slug);

      if (summariesError) {
        console.log(`   ⚠️ Failed to update summaries.audio_url: ${summariesError.message}`);
      } else {
        console.log(`   ✅ Updated summaries.audio_url`);
      }

    } catch (error) {
      const err = error as Error;
      console.error(`   ❌ Failed: ${err.message}`);
    }

    console.log(''); // Empty line between stories
  }

  // Final verification
  console.log('📊 Final status:');
  const { data: storiesData } = await supabase
    .from('stories')
    .select('slug, audio_url')
    .order('slug');

  storiesData?.forEach(s => {
    console.log(`   ${s.slug}: ${s.audio_url ? '✅ has audio' : '❌ no audio'}`);
  });
}

generateAudioForAllStories()
  .then(() => {
    console.log('\n✨ Audio generation complete!');
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });