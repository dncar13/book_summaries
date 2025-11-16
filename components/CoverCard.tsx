import Link from 'next/link';
import clsx from 'classnames';
import type { Summary } from '@/lib/types';
import { GeneratedCover } from './GeneratedCover';

interface CoverCardProps {
  summary: Summary;
}

export function CoverCard({ summary }: CoverCardProps) {
  return (
    <Link
      href={`/summary/${summary.slug}`}
      className="group flex min-w-[280px] snap-center flex-col gap-4 rounded-3xl bg-white/90 p-4 shadow-card ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/80 sm:min-w-0"
    >
      <GeneratedCover seed={summary.cover_seed ?? summary.slug} title={summary.title_en} className="h-52 w-full" />
      <div className="flex flex-col gap-2 text-right">
        <span className="text-xs font-semibold text-brand-teal">{summary.category_he}</span>
        <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-brand-violet dark:text-slate-100">
          {summary.title_en}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{summary.author_en}</p>
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {summary.minutes_estimated} דק׳
          </span>
          <span className="text-xs">קרא עוד →</span>
        </div>
      </div>
    </Link>
  );
}

export function CoverCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-white/80 p-4 shadow-card ring-1 ring-black/5 dark:bg-slate-900/70">
      <div className="mb-4 h-52 w-full rounded-3xl bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
