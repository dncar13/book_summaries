import { z } from 'zod';
import type { ModelProvider } from './provider';
import { withProviderLimit } from './provider';

export async function hedgeJSON<T>(
  providers: ModelProvider[],
  system: string,
  user: string,
  schema: z.ZodType<T>
): Promise<{ provider: string; data: T }> {
  if (!providers.length) {
    throw new Error('hedgeJSON called without providers');
  }

  const schemaName = schema.description ?? 'schema';
  const attempts = providers.map((provider) =>
    withProviderLimit(provider, async () => {
      try {
        const raw = await provider.callJSON({ system, user, schemaName });
        const parsed = schema.parse(JSON.parse(raw));
        return { provider: provider.name, data: parsed };
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`${provider.name}: ${reason}`);
      }
    })
  );

  try {
    return await Promise.any(attempts);
  } catch (error) {
    if (error instanceof AggregateError) {
      const combined = error.errors.map((err) => (err instanceof Error ? err.message : String(err))).join('; ');
      throw new Error(`All providers failed: ${combined}`);
    }
    throw error;
  }
}
