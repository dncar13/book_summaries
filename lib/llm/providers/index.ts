import type { AgentRunKind } from '@/lib/types';
import type { ModelProvider } from '../provider';

const providerRegistry: Partial<Record<AgentRunKind, ModelProvider[]>> = {};

export function registerProviders(kind: AgentRunKind, providers: ModelProvider[]) {
  providerRegistry[kind] = providers;
}

export function getProvidersFor(kind: AgentRunKind) {
  const providers = providerRegistry[kind];
  if (!providers || providers.length === 0) {
    throw new Error(`No LLM providers configured for ${kind}. Add entries in lib/llm/providers.`);
  }
  return providers;
}

// Example placeholder configuration—replace with real providers under lib/llm/providers.
registerProviders('story', []);
registerProviders('cover', []);
