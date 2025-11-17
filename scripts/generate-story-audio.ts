import 'dotenv/config';

import { getServiceSupabaseClient } from '@/lib/supabaseAdmin';
import { summaries } from '@/data/summaries';
import type { Summary } from '@/lib/types';
import {
  fetchStoriesFromDatabase,
  generateStoryAudio,
  pickStoryTable,
  type ProviderFlag,
  type SplitMode,
  type StoryInput,
} from '@/lib/tts/generateStoryAudio';

type CliOptions = {
  target: string;
  force: boolean;
  split: SplitMode;
  provider: ProviderFlag;
};

function parseArgs(argv: string[]): CliOptions {
  let target = '';
  let force = false;
  let split: SplitMode = 'whole';
  let provider: ProviderFlag = 'google';

  for (const arg of argv) {
    if (arg === '--force') {
      force = true;
      continue;
    }
    if (arg.startsWith('--split=')) {
      const value = arg.split('=')[1];
      split = value === 'section' ? 'section' : 'whole';
      continue;
    }
    if (arg.startsWith('--provider=')) {
      const value = arg.split('=')[1];
      provider = value === 'eleven' || value === 'elevenlabs' ? 'elevenlabs' : 'google';
      continue;
    }
    if (!target) {
      target = arg;
    }
  }

  if (!target) {
    console.error(
      'Usage: npx tsx scripts/generate-story-audio.ts <slug|all> [--force] [--split=whole|section] [--provider=google|eleven]'
    );
    process.exit(1);
  }

  return { target, force, split, provider };
}

function tryGetSupabaseClient() {
  try {
    return getServiceSupabaseClient();
  } catch (error) {
    const err = error as Error;
    console.warn('[tts] Supabase service client unavailable:', err.message);
    return null;
  }
}

const supabase = tryGetSupabaseClient();

function loadStoriesFromLocal(slugs?: string[]): StoryInput[] {
  const set = slugs?.length ? new Set(slugs) : null;

  return summaries
    .filter((summary) => !set || set.has(summary.slug))
    .map((summary: Summary) => ({
      slug: summary.slug,
      title_en: summary.title_en,
      body_en: summary.body_en,
      audio_url: summary.audio_url ?? null,
      audio_parts: summary.audio_parts ?? null,
    }));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const isAll = options.target === 'all';
  const lookupSlugs = isAll ? undefined : [options.target];

  let table: 'stories' | 'summaries' | null = null;
  if (supabase) {
    table = await pickStoryTable(supabase);
    if (!table) {
      console.warn('[tts] No stories/summaries table found; will skip DB updates.');
    }
  }

  let stories: StoryInput[] = [];

  if (table && supabase) {
    try {
      stories = await fetchStoriesFromDatabase(supabase, table, lookupSlugs);
    } catch (error) {
      console.error(`[tts] Failed to load ${table} from Supabase:`, (error as Error).message);
    }
  }

  if (!stories.length) {
    console.warn(
      `[tts] Falling back to local summaries for ${lookupSlugs?.join(', ') ?? 'all stories'}.`
    );
    stories = loadStoriesFromLocal(lookupSlugs);
  }

  if (!stories.length) {
    console.error(`[tts] No stories found for target "${options.target}".`);
    process.exit(1);
  }

  console.log(
    `🎧 Generating audio for ${stories.length} story(ies) (split=${options.split}, provider=${options.provider})\n`
  );

  for (const story of stories) {
    try {
      const result = await generateStoryAudio({
        story,
        split: options.split,
        provider: options.provider,
        force: options.force,
        supabase,
        table,
      });

      if (result.skipped) {
        const reason =
          result.reason === 'audio_exists'
            ? 'audio already exists'
            : result.reason === 'sections_exist'
              ? 'section audio already exists'
              : 'no sections to synthesize';
        console.log(`⏭️  ${story.slug} skipped (${reason}).`);
        continue;
      }

      if (options.split === 'section') {
        console.log(
          `✅ ${story.slug}: generated ${result.audioParts?.length ?? 0} section clips${
            result.errors?.length ? ` (errors: ${result.errors.join(', ')})` : ''
          }`
        );
      } else {
        console.log(
          `✅ ${story.slug}: ${result.bytes ?? 0} bytes via ${result.provider} -> ${result.audioUrl}`
        );
      }
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Failed to generate audio for ${story.slug}: ${err.message}`);
    }
  }
}

main();
