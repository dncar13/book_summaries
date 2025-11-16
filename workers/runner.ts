import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { hedgeJSON } from '@/lib/llm/router';
import { getProvidersFor } from '@/lib/llm/providers';
import { StoryDoc, CoverSpec } from '@/lib/contentSchemas';
import { storySystem, storyUser } from '@/lib/prompts/story';
import { coverSystem, coverUser } from '@/lib/prompts/cover';
import type { AgentRunKind, AgentRunRow, StoryLevel } from '@/lib/types';
import type { Database } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for the runner.');
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const BATCH = parseInt(process.env.AGENT_BATCH_SIZE ?? '4', 10);
const LOOP_DELAY_MS = parseInt(process.env.AGENT_LOOP_DELAY_MS ?? '1000', 10);

type StoryJobInput = {
  topic: string;
  level: StoryLevel;
  minutes: number;
  genre?: string;
};

type CoverJobInput = {
  slug: string;
  title_en: string;
  genre: string;
  hook: string;
};

async function takeJobs(kind: AgentRunKind, limit: number) {
  const { data, error } = await supabase.rpc('take_agent_jobs', {
    p_kind: kind,
    p_limit: limit
  });
  if (error) {
    throw error;
  }
  return (data ?? []) as AgentRunRow[];
}

async function runStoryJob(job: AgentRunRow, input: StoryJobInput) {
  const { provider, data } = await hedgeJSON(
    getProvidersFor('story'),
    storySystem(),
    storyUser(input),
    StoryDoc
  );

  const row = {
    ...data,
    updated_at: new Date().toISOString()
  };

  await supabase.from('stories').upsert(row, { onConflict: 'slug' });
  await supabase
    .from('agent_runs')
    .update({
      status: 'succeeded',
      output: { provider, slug: data.slug },
      finished_at: new Date().toISOString()
    })
    .eq('id', job.id);
}

async function runCoverJob(job: AgentRunRow, input: CoverJobInput) {
  const { provider, data } = await hedgeJSON(
    getProvidersFor('cover'),
    coverSystem(),
    coverUser(input),
    CoverSpec
  );

  await supabase
    .from('stories')
    .update({ cover_spec: data, updated_at: new Date().toISOString() })
    .eq('slug', input.slug);

  await supabase
    .from('agent_runs')
    .update({
      status: 'succeeded',
      output: { provider, slug: input.slug },
      finished_at: new Date().toISOString()
    })
    .eq('id', job.id);
}

async function runJob(job: AgentRunRow) {
  try {
    if (job.kind === 'story') {
      await runStoryJob(job, job.input as StoryJobInput);
    } else if (job.kind === 'cover') {
      await runCoverJob(job, job.input as CoverJobInput);
    } else {
      throw new Error(`Unsupported job kind ${job.kind}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase
      .from('agent_runs')
      .update({
        status: 'failed',
        error: message,
        finished_at: new Date().toISOString()
      })
      .eq('id', job.id);
    console.error(`[runner] job ${job.id} failed: ${message}`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mainLoop(kind: AgentRunKind) {
  console.info(`[runner] starting loop for kind=${kind} batch=${BATCH}`);
  while (true) {
    try {
      const jobs = await takeJobs(kind, BATCH);
      if (jobs.length) {
        await Promise.all(jobs.map(runJob));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[runner] loop error: ${message}`);
      await sleep(LOOP_DELAY_MS);
    }
    await sleep(LOOP_DELAY_MS);
  }
}

if (require.main === module) {
  const argKind = (process.argv[2] as AgentRunKind) ?? (process.env.AGENT_KIND as AgentRunKind);
  if (!argKind || !['story', 'cover'].includes(argKind)) {
    console.error('Usage: tsx workers/runner.ts <story|cover>');
    process.exit(1);
  }

  mainLoop(argKind).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
