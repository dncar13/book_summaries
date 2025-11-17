import 'dotenv/config';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';
import { textToSpeech, type ProviderName } from './text-to-speech';

export type StoryInput = {
  slug: string;
  title_en: string;
  body_en: string;
  audio_url?: string | null;
  audio_parts?: string[] | null;
};

export type SplitMode = 'whole' | 'section';
export type ProviderFlag = 'google' | 'elevenlabs';

const DEFAULT_AUDIO_DEST = process.env.AUDIO_DEST_DIR || 'listening';

export async function pickStoryTable(supa: SupabaseClient<Database>) {
  const tryTable = async (name: 'stories' | 'summaries') => supa.from(name).select('slug').limit(1);
  const stories = await tryTable('stories');
  if (!stories.error) return 'stories' as const;
  const summaries = await tryTable('summaries');
  if (!summaries.error) return 'summaries' as const;
  return null;
}

export async function fetchStoriesFromDatabase(
  supabase: SupabaseClient<Database>,
  table: 'stories' | 'summaries',
  slugs?: string[]
): Promise<StoryInput[]> {
  let query = supabase
    .from(table)
    .select('slug, title_en, body_en, audio_url, audio_parts')
    .order('slug');

  if (slugs && slugs.length) {
    query = query.in('slug', slugs);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter((row) => Boolean(row?.body_en))
    .map((row) => ({
      slug: row.slug,
      title_en: row.title_en,
      body_en: row.body_en,
      audio_url: row.audio_url ?? null,
      audio_parts: row.audio_parts ?? null,
    }));
}

export function splitBodyIntoSections(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function updateStoryAudioRecord(
  supabase: SupabaseClient<Database> | null,
  table: 'stories' | 'summaries' | null,
  slug: string,
  payload: { audio_url?: string | null; audio_parts?: string[] | null }
) {
  if (!supabase || !table) return;
  const { error } = await supabase.from(table).update(payload).eq('slug', slug);
  if (error) {
    throw new Error(error.message);
  }
}

export type GenerateStoryAudioParams = {
  story: StoryInput;
  split: SplitMode;
  provider: ProviderFlag;
  force?: boolean;
  supabase?: SupabaseClient<Database> | null;
  table?: 'stories' | 'summaries' | null;
  audioDestDir?: string;
};

export type AudioPartMeta = {
  url: string;
  provider: ProviderName;
  bytes: number;
};

export type GenerateStoryAudioResult = {
  slug: string;
  skipped: boolean;
  reason?: 'audio_exists' | 'sections_exist' | 'no_sections';
  audioUrl?: string;
  audioParts?: string[];
  provider?: ProviderName;
  bytes?: number;
  partsMeta?: AudioPartMeta[];
  errors?: string[];
};

export async function generateStoryAudio({
  story,
  split,
  provider,
  force = false,
  supabase,
  table,
  audioDestDir = DEFAULT_AUDIO_DEST,
}: GenerateStoryAudioParams): Promise<GenerateStoryAudioResult> {
  if (split === 'whole') {
    if (story.audio_url && !force) {
      return { slug: story.slug, skipped: true, reason: 'audio_exists' };
    }

    const filename = `${story.slug}.mp3`;
    const storagePath = `${audioDestDir}/stories/${filename}`;
    const result = await textToSpeech(story.body_en, filename, {
      storagePath,
      preferredProvider: provider,
    });

    await updateStoryAudioRecord(supabase ?? null, table ?? null, story.slug, {
      audio_url: result.audioUrl,
      audio_parts: null,
    });

    return {
      slug: story.slug,
      skipped: false,
      audioUrl: result.audioUrl,
      provider: result.provider,
      bytes: result.bytes,
    };
  }

  if (story.audio_parts?.length && !force) {
    return { slug: story.slug, skipped: true, reason: 'sections_exist' };
  }

  const sections = splitBodyIntoSections(story.body_en);
  if (!sections.length) {
    return { slug: story.slug, skipped: true, reason: 'no_sections' };
  }

  const urls: string[] = [];
  const partsMeta: AudioPartMeta[] = [];
  const errors: string[] = [];

  for (const [index, section] of sections.entries()) {
    const part = String(index + 1).padStart(2, '0');
    const filename = `${story.slug}-part-${part}.mp3`;
    const storagePath = `${audioDestDir}/sections/${story.slug}/${filename}`;
    try {
      const result = await textToSpeech(section, filename, {
        storagePath,
        preferredProvider: provider,
      });
      urls.push(result.audioUrl);
      partsMeta.push({
        url: result.audioUrl,
        provider: result.provider,
        bytes: result.bytes,
      });
    } catch (error) {
      errors.push(
        `part_${part}: ${(error as Error).message}`
      );
    }
  }

  if (!urls.length) {
    return {
      slug: story.slug,
      skipped: errors.length === 0,
      reason: sections.length ? undefined : 'no_sections',
      errors: errors.length ? errors : undefined,
    };
  }

  await updateStoryAudioRecord(supabase ?? null, table ?? null, story.slug, {
    audio_url: null,
    audio_parts: urls,
  });

    return {
      slug: story.slug,
      skipped: false,
      audioParts: urls,
      partsMeta,
      errors: errors.length ? errors : undefined,
    };
  }
