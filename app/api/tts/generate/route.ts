import 'dotenv/config';

import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabaseAdmin';
import {
  fetchStoriesFromDatabase,
  generateStoryAudio,
  pickStoryTable,
  type ProviderFlag,
  type SplitMode,
  type StoryInput,
} from '@/lib/tts/generateStoryAudio';
import { summaries } from '@/data/summaries';

const RATE_LIMITS = new Map<string, number>();
const WINDOW_MS = 60_000;

function loadLocalStory(slug: string): StoryInput | null {
  const summary = summaries.find((item) => item.slug === slug);
  if (!summary) return null;
  return {
    slug: summary.slug,
    title_en: summary.title_en,
    body_en: summary.body_en,
    audio_url: summary.audio_url ?? null,
    audio_parts: summary.audio_parts ?? null,
  };
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const slug =
    typeof body.slug === 'string' && body.slug.trim().length > 0 ? body.slug.trim() : null;
  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const now = Date.now();
  const lastRun = RATE_LIMITS.get(slug);
  if (lastRun && now - lastRun < WINDOW_MS) {
    const retryMs = Math.ceil((WINDOW_MS - (now - lastRun)) / 1000);
    return NextResponse.json(
      { error: `Please wait ${retryMs}s before regenerating this slug.` },
      { status: 429 }
    );
  }

  const supabase = getServiceSupabaseClient();
  const table = await pickStoryTable(supabase);

  let story: StoryInput | undefined;

  if (table) {
    const data = await fetchStoriesFromDatabase(supabase, table, [slug]);
    story = data[0];
  }

  if (!story) {
    story = loadLocalStory(slug) ?? undefined;
  }

  if (!story) {
    return NextResponse.json({ error: `Story "${slug}" not found` }, { status: 404 });
  }

  const split: SplitMode = body.split === 'section' ? 'section' : 'whole';
  const providerInput = typeof body.provider === 'string' ? body.provider : undefined;
  const provider: ProviderFlag =
    providerInput === 'eleven' || providerInput === 'elevenlabs' ? 'elevenlabs' : 'google';
  const force = Boolean(body.force);

  RATE_LIMITS.set(slug, now);
  let success = false;

  try {
    const result = await generateStoryAudio({
      story,
      split,
      provider,
      force,
      supabase,
      table,
    });

    success = true;

    return NextResponse.json({
      slug: result.slug,
      split,
      provider: result.provider ?? provider,
      skipped: result.skipped,
      reason: result.reason,
      audioUrl: result.audioUrl,
      audioParts: result.audioParts,
      bytes: result.bytes,
      partsMeta: result.partsMeta,
      errors: result.errors,
    });
  } catch (error) {
    RATE_LIMITS.delete(slug);
    return NextResponse.json(
      { error: (error as Error).message ?? 'Failed to generate audio' },
      { status: 500 }
    );
  } finally {
    if (!success) {
      RATE_LIMITS.delete(slug);
    }
  }
}
