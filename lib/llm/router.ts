import { z } from 'zod';
import type { ModelProvider } from './provider';

const running = new Map<string, number>();
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function withProviderSlot<T>(p: ModelProvider, fn: () => Promise<T>): Promise<T> {
  const limit = p.maxConcurrent || 1;
  while ((running.get(p.name) ?? 0) >= limit) {
    await sleep(20);
  }
  running.set(p.name, (running.get(p.name) ?? 0) + 1);
  try {
    return await fn();
  } finally {
    running.set(p.name, (running.get(p.name) ?? 0) - 1);
  }
}

function extractFirstJson(s: string): string {
  s = s.trim();
  if (s.startsWith('{') && s.endsWith('}')) return s;
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) return s.slice(start, end + 1);
  return s;
}

export async function hedgeJSON<T>(
  providers: ModelProvider[],
  system: string,
  user: string,
  schema: z.ZodType<T>
): Promise<{ provider: string; data: T }> {
  if (!providers.length) throw new Error('No providers configured');

  const attempts = providers.map(async (p) => {
    try {
      const raw = await withProviderSlot(p, () => p.callJSON({ system, user, schemaName: schema.description ?? 'schema' }));
      const jsonStr = extractFirstJson(raw);
      const parsed = schema.parse(JSON.parse(jsonStr));
      return { provider: p.name, data: parsed };
    } catch (err) {
      throw new Error(`${p.name} failed: ${String(err)}`);
    }
  });

  return await Promise.any(attempts);
}
