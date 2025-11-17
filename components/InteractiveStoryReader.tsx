'use client';

import { useMemo, useState } from 'react';
import { buildGlobalGlossaryMap } from '@/data/vocab/global-core';
import type { WordGlossaryEntry } from '@/lib/types';
import { normalizeWord, tokenizeParagraph, type Token } from '@/lib/textTokens';

interface InteractiveStoryReaderProps {
  text: string;
  glossary: WordGlossaryEntry[];
  fontScale?: number;
}

type SelectedWord = {
  tokenId: string;
  surface: string;
  translation: string;
  base: string;
};

const NO_TRANSLATION_COPY = 'תרגום יתווסף בקרוב';

export function InteractiveStoryReader({ text, glossary, fontScale = 1 }: InteractiveStoryReaderProps) {
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);

  const globalGlossaryMap = useMemo(() => buildGlobalGlossaryMap(), []);

  const glossaryLookup = useMemo(() => {
    const map = new Map<string, WordGlossaryEntry>(globalGlossaryMap);
    glossary.forEach((entry) => {
      const normalizedBase = normalizeWord(entry.base);
      if (normalizedBase) {
        map.set(normalizedBase, entry);
      }

      entry.forms.forEach((form) => {
        const normalizedForm = normalizeWord(form);
        if (normalizedForm) {
          map.set(normalizedForm, entry);
        }
      });
    });
    return map;
  }, [glossary, globalGlossaryMap]);

  const paragraphs = useMemo(() => {
    return text
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
  }, [text]);

  const tokenizedParagraphs = useMemo(() => {
    return paragraphs.map((paragraph) => tokenizeParagraph(paragraph));
  }, [paragraphs]);

  const handleWordClick = (tokenId: string, token: Token, entry?: WordGlossaryEntry) => {
    if (token.type !== 'word') return;

    setSelectedWord({
      tokenId,
      surface: token.text,
      translation: entry?.translationHe ?? NO_TRANSLATION_COPY,
      base: entry?.base ?? token.text
    });
  };

  return (
    <article
      className="relative space-y-4 text-right leading-8"
      style={{ fontSize: `${fontScale}rem`, direction: 'rtl' }}
    >
      {tokenizedParagraphs.map((tokens, paragraphIndex) => (
        <p key={paragraphIndex} dir="ltr" className="font-inter whitespace-pre-wrap" data-paragraph-index={paragraphIndex}>
          {tokens.map((token, tokenIndex) => {
            if (token.type === 'word') {
              const normalized = token.normalized;
              const entry = glossaryLookup.get(normalized);
              const tokenId = `${paragraphIndex}-${tokenIndex}`;
              const isActive = selectedWord?.tokenId === tokenId;

              return (
                <button
                  key={tokenId}
                  type="button"
                  onClick={() => handleWordClick(tokenId, token, entry)}
                  data-word-base={entry?.base ?? undefined}
                  className={`inline rounded px-0.5 text-left underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
                    isActive ? 'bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20' : 'hover:bg-slate-200/70 hover:underline dark:hover:bg-slate-700/60'
                  }`}
                >
                  {token.text}
                </button>
              );
            }

            return (
              <span key={`${paragraphIndex}-${tokenIndex}`} className="whitespace-pre">
                {token.text}
              </span>
            );
          })}
        </p>
      ))}

      {selectedWord ? (
        <div
          aria-live="polite"
          dir="rtl"
          className="fixed inset-x-4 bottom-6 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 text-right shadow-lg backdrop-blur md:inset-x-auto md:right-8 md:w-80 dark:border-slate-700 dark:bg-slate-900/90"
        >
          <p className="text-xs font-semibold text-slate-500">לחצת על</p>
          <p className="text-xl font-inter text-slate-900 dark:text-white">{selectedWord.surface}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">תרגום לעברית</p>
          <p className="text-xl font-heebo text-slate-900 dark:text-white">{selectedWord.translation}</p>
        </div>
      ) : null}
    </article>
  );
}
