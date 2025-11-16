'use client';

import { useEffect, useState } from 'react';
import {
  POINTS_STORAGE_KEY,
  STREAK_STORAGE_KEY,
  LAST_FINISH_STORAGE_KEY
} from '@/lib/session';

export function RewardsPanel() {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastDay, setLastDay] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const load = () => {
      setPoints(Number(window.localStorage.getItem(POINTS_STORAGE_KEY) ?? '0'));
      setStreak(Number(window.localStorage.getItem(STREAK_STORAGE_KEY) ?? '0'));
      setLastDay(window.localStorage.getItem(LAST_FINISH_STORAGE_KEY));
    };

    const handleCustom = () => load();

    load();
    window.addEventListener('storage', load);
    window.addEventListener('learnflow-rewards', handleCustom);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('learnflow-rewards', handleCustom);
    };
  }, []);

  return (
    <div className="rounded-3xl bg-white/90 p-4 text-right shadow-card ring-1 ring-black/5 dark:bg-slate-900/70">
      <p className="text-sm text-slate-500">מד הלמידה</p>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold">{points}</p>
          <p className="text-sm text-slate-500">נקודות</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{streak}</p>
          <p className="text-sm text-slate-500">ימי רצף</p>
        </div>
      </div>
      {lastDay ? (
        <p className="mt-3 text-xs text-slate-400">סיפור אחרון שהושלם ב־{lastDay}</p>
      ) : null}
    </div>
  );
}
