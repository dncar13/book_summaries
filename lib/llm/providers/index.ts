import type { ModelProvider } from '../provider';
import { openAIProvider } from './openai';
import { anthropicProvider } from './anthropic';

export function getProvidersFor(kind: 'story'|'cover'|'rewriter'): ModelProvider[] {
  const list: ModelProvider[] = [];
  if (process.env.OPENAI_API_KEY) list.push(openAIProvider);
  if (process.env.ANTHROPIC_API_KEY) list.push(anthropicProvider);

  // אם תרצה להגביל cover לספק אחד:
  if (kind === 'cover') return list.filter(p => p.name === 'openai');

  return list;
}
