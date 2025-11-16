import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabaseAdmin';
import type { AgentRunKind, Database } from '@/lib/types';

const enqueuePayload = z.object({
  kind: z.union([z.literal('story'), z.literal('cover')]),
  items: z.array(z.unknown()).min(1)
});

const storyJob = z.object({
  topic: z.string().min(3),
  level: z.union([z.literal('B1'), z.literal('B2')]),
  minutes: z.number().int().min(10).max(20),
  genre: z.string().optional()
});

const coverJob = z.object({
  slug: z.string().min(3),
  title_en: z.string().min(3),
  genre: z.string().min(3),
  hook: z.string().min(10)
});

const jobSchemas: Record<AgentRunKind, typeof storyJob | typeof coverJob> = {
  story: storyJob,
  cover: coverJob
};

type AgentRunInsert = Database['public']['Tables']['agent_runs']['Insert'];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function jobKey(kind: AgentRunKind, input: Record<string, unknown>) {
  const raw = (input.slug as string) ?? (input.topic as string);
  if (!raw) return null;
  return `${kind}:${slugify(raw)}`;
}

export async function POST(request: Request) {
  const supabase = getServiceSupabaseClient();
  const payload = await request.json().catch(() => null);
  const parsed = enqueuePayload.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { kind, items } = parsed.data;
  const schema = jobSchemas[kind];
  const normalized = [];

  for (const item of items) {
    const result = schema.safeParse(item);
    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error.flatten() }, { status: 400 });
    }
    normalized.push(result.data);
  }

  const rows: AgentRunInsert[] = normalized.map((input) => ({
    kind,
    status: 'queued' as const,
    job_key: jobKey(kind, input),
    input
  }));

  const { error } = await supabase.from('agent_runs').insert(rows);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
