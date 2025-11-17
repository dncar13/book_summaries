import amiramVocab from '@/data/amiram-vocab.json';
import type { WordGlossaryEntry } from '@/lib/types';
import { normalizeWord } from '@/lib/textTokens';

type AmiramWord = {
  word?: string;
  translation?: string;
};

function buildForms(base: string): string[] {
  const trimmed = base.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  const capital = lower.charAt(0).toUpperCase() + lower.slice(1);
  const variants = new Set<string>([
    trimmed,
    lower,
    capital,
    `${lower},`,
    `${lower}.`,
    `${capital},`,
    `${capital}.`
  ]);

  return Array.from(variants);
}

function mapWordToEntry(word: AmiramWord): WordGlossaryEntry | null {
  const base = typeof word.word === 'string' ? word.word.trim() : '';
  const translationHe = typeof word.translation === 'string' ? word.translation.trim() : '';

  if (!base || !translationHe) {
    return null;
  }

  return {
    base,
    translationHe,
    forms: buildForms(base)
  };
}

const amiramWords = Array.isArray(amiramVocab.words) ? amiramVocab.words : [];

export const coreGlossary: WordGlossaryEntry[] = amiramWords
  .map((word) => mapWordToEntry(word))
  .filter((entry): entry is WordGlossaryEntry => Boolean(entry));

export function buildGlobalGlossaryMap(): Map<string, WordGlossaryEntry> {
  const map = new Map<string, WordGlossaryEntry>();

  coreGlossary.forEach((entry) => {
    const baseNorm = normalizeWord(entry.base);
    if (baseNorm) {
      map.set(baseNorm, entry);
    }

    entry.forms.forEach((form) => {
      const norm = normalizeWord(form);
      if (norm) {
        map.set(norm, entry);
      }
    });
  });

  return map;
}
