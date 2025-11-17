import type { WordGlossaryEntry } from '@/lib/types';
import { glossary as story1Glossary } from './story-1';
import { glossary as story2Glossary } from './story-2';
import { glossary as story3Glossary } from './story-3';

const glossaryBySlug: Record<string, WordGlossaryEntry[]> = {
  'deliberate-focus-horizon': story1Glossary,
  'decision-waves-lab': story2Glossary,
  'steady-creative-current': story3Glossary
};

export function getGlossaryForSummary(slug: string): WordGlossaryEntry[] | undefined {
  return glossaryBySlug[slug];
}
