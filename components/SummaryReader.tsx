'use client';

import { useEffect, useRef, useState } from 'react';
import type { Summary } from '@/lib/types';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { ProgressBar } from './ProgressBar';
import { GeneratedCover } from './GeneratedCover';
import { InteractiveStoryReader } from './InteractiveStoryReader';
import { AudioPlaylist } from '@/components/AudioPlaylist';
import { getGlossaryForSummary } from '@/data/glossary';

interface SummaryReaderProps {
  summary: Summary;
}

export function SummaryReader({ summary }: SummaryReaderProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const { progress, finished, points, streak, updateProgress, markFinished } = useReadingProgress(summary.slug);
  const [fontScale, setFontScale] = useState(1);
  const [liked, setLiked] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const glossary = getGlossaryForSummary(summary.slug);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const doc = document.documentElement;
      const scrollY = window.scrollY || doc.scrollTop;
      const articleTop = articleRef.current.offsetTop;
      const totalHeight = articleRef.current.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const raw = ((scrollY - articleTop) / totalHeight) * 100;
      const next = Math.min(100, Math.max(0, raw));
      updateProgress(next);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [updateProgress]);

  const handleShare = async () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/summary/${summary.slug}?utm_source=learnflow&utm_medium=share`;
    const shareData = {
      title: summary.title_en,
      text: `בואי לקרוא את הסיפור ${summary.title_en} ב-LearnFlow`
    };
    try {
      if (navigator.share) {
        await navigator.share({ ...shareData, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('הקישור הועתק');
        setTimeout(() => setShareMessage(null), 2000);
      }
    } catch (error) {
      console.error('share failed', error);
    }
  };

  return (
    <section className="space-y-6" ref={articleRef}>
      <div className="flex flex-col gap-4 text-right">
        <p className="text-sm text-slate-500">{summary.category_he} • {summary.minutes_estimated} דק׳</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{summary.title_en}</h1>
        <p className="text-base text-slate-500 dark:text-slate-300">{summary.author_en}</p>
        <div className="flex flex-wrap justify-between gap-3 text-sm text-slate-600 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <span>🎯 התקדמות</span>
            <ProgressBar value={progress} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFontScale((value) => Math.min(1.3, value + 0.05))}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold dark:border-slate-700"
            >
              טקסט גדול יותר
            </button>
            <button
              onClick={() => setFontScale((value) => Math.max(0.85, value - 0.05))}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold dark:border-slate-700"
            >
              טקסט קטן יותר
            </button>
          </div>
        </div>
        <GeneratedCover seed={summary.cover_seed ?? summary.slug} title={summary.title_en} className="h-60 w-full" />
      </div>

      {summary.audio_parts?.length ? (
        <div className="mb-4">
          <AudioPlaylist parts={summary.audio_parts} title="האזן לסיפור" slug={summary.slug} />
        </div>
      ) : summary.audio_url ? (
        <div className="mb-4">
          <AudioPlaylist parts={[summary.audio_url]} title="האזן לסיפור" slug={summary.slug} />
        </div>
      ) : null}

      {glossary ? (
        <InteractiveStoryReader text={summary.body_en} glossary={glossary} fontScale={fontScale} />
      ) : (
        <article
          className="prose prose-slate mx-auto max-w-3xl text-right leading-8 dark:prose-invert"
          style={{ fontSize: `${fontScale}rem`, direction: 'rtl' }}
        >
          {summary.body_en.split('\n\n').map((paragraph, index) => (
            <p key={index} dir="ltr" className="font-inter">
              {paragraph}
            </p>
          ))}
        </article>
      )}

      <div className="mt-8 rounded-3xl bg-slate-100/80 p-6 text-right dark:bg-slate-800/60">
        <p className="text-sm font-semibold text-slate-500">TL;DR בעברית</p>
        {summary.tldr_he.split('\n').map((line, idx) => (
          <p key={idx} className="mt-2 text-lg font-heebo">
            {line}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={markFinished}
          className="flex-1 rounded-full bg-brand-teal px-4 py-3 text-center text-base font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={finished}
        >
          {finished ? 'כבר סומן כהושלם' : 'סמן כסיום'}
        </button>
        <button
          onClick={() => setLiked((prev) => !prev)}
          className={
            'flex-1 rounded-full border px-4 py-3 text-base font-semibold transition ' +
            (liked
              ? 'border-brand-violet text-brand-violet'
              : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-200')
          }
        >
          {liked ? '💜 אהוב' : 'אהבתי'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-700 dark:text-slate-100"
        >
          שיתוף
        </button>
      </div>
      {shareMessage ? <p className="text-center text-sm text-emerald-500">{shareMessage}</p> : null}

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p>יש לך {points} נקודות ו-{streak} ימי רצף 🌀</p>
        <p className="mt-2 text-xs">כל הטקסטים והכריכות מקוריים ונכתבו במיוחד ללומדות LearnFlow.</p>
      </div>
    </section>
  );
}
