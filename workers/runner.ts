import 'dotenv/config';
import { getServiceSupabaseClient } from '@/lib/supabaseAdmin';
import { hedgeJSON } from '@/lib/llm/router';
import { getProvidersFor } from '@/lib/llm/providers';
import { StoryDoc, CoverSpec } from '@/lib/contentSchemas';
import { storySystem, storyUser } from '@/lib/prompts/story';
import { coverSystem, coverUser } from '@/lib/prompts/cover';
import { quickReadabilityCheck } from '@/lib/readability';

const supa = getServiceSupabaseClient();
const BATCH = parseInt(process.env.AGENT_BATCH_SIZE ?? '4', 10);
const LOOP_DELAY_MS = parseInt(process.env.AGENT_LOOP_DELAY_MS ?? '1000', 10);

type Kind = 'story'|'cover';

async function takeJobs(kind: Kind, n: number) {
  const { data, error } = await supa.rpc('take_agent_jobs', { p_kind: kind, p_limit: n });
  if (error) throw error;
  return data as any[];
}

async function runStoryJob(job: any) {
  const input = job.input as { topic: string; level?: 'B1'|'B2'; minutes?: number; genre?: string };
  const { provider, data } = await hedgeJSON(
    getProvidersFor('story'),
    storySystem(),
    storyUser(input),
    StoryDoc
  );

  const quality = quickReadabilityCheck(data.body_en);

  const { error: upsertErr } = await supa.from('stories').upsert({
    slug: data.slug,
    title_en: data.title_en,
    level: data.level,
    reading_minutes: data.reading_minutes,
    genre: data.genre,
    hook: data.hook,
    tldr_he: data.tldr_he,
    body_en: data.body_en,
    sections: data.sections,
    vocab: data.vocab,
    quiz: data.quiz,
    topics: data.topics,
    cover_spec: data.cover_spec ?? null,
    audio_url: null
  });
  if (upsertErr) throw upsertErr;

  await supa.from('agent_runs').update({
    status: 'succeeded',
    output: { provider, slug: data.slug, quality },
    finished_at: new Date().toISOString()
  }).eq('id', job.id);
}

async function runCoverJob(job: any) {
  const input = job.input as { slug: string; title_en: string; genre: string; hook: string };
  const { provider, data } = await hedgeJSON(
    getProvidersFor('cover'),
    coverSystem(),
    coverUser({ title_en: input.title_en, genre: input.genre, hook: input.hook }),
    CoverSpec
  );

  const { error } = await supa.from('stories').update({ cover_spec: data }).eq('slug', input.slug);
  if (error) throw error;

  await supa.from('agent_runs').update({
    status: 'succeeded',
    output: { provider },
    finished_at: new Date().toISOString()
  }).eq('id', job.id);
}

async function runJob(job: any) {
  try {
    if (job.kind === 'story') {
      await runStoryJob(job);
    } else if (job.kind === 'cover') {
      await runCoverJob(job);
    } else {
      throw new Error(`Unknown kind ${job.kind}`);
    }
  } catch (e: any) {
    await supa.from('agent_runs').update({
      status: 'failed',
      error: String(e),
      finished_at: new Date().toISOString()
    }).eq('id', job.id);
  }
}

export async function mainLoop(kind: Kind) {
  while (true) {
    const jobs = await takeJobs(kind, BATCH);
    await Promise.all(jobs.map(runJob));
    await new Promise(r => setTimeout(r, LOOP_DELAY_MS));
  }
}

// CLI: npx tsx workers/runner.ts story|cover
if (require.main === module) {
  const kind = (process.argv[2] as Kind) || 'story';
  mainLoop(kind).catch((e) => {
    console.error('Runner fatal error:', e);
    process.exit(1);
  });
}
