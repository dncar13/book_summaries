'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DAILY_VIEW_STORAGE_KEY,
  FINISHED_STORAGE_KEY,
  LAST_FINISH_STORAGE_KEY,
  POINTS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  STREAK_STORAGE_KEY
} from '@/lib/session';
import { logEvent } from '@/lib/eventClient';

type ProgressMap = Record<string, number>;
type FinishedMap = Record<string, boolean>;

type ReadingState = {
  progress: number;
  finished: boolean;
  points: number;
  streak: number;
  updateProgress: (value: number) => void;
  markFinished: () => void;
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useReadingProgress(slug: string): ReadingState {
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedProgress = readJSON<ProgressMap>(PROGRESS_STORAGE_KEY, {});
    const storedFinished = readJSON<FinishedMap>(FINISHED_STORAGE_KEY, {});
    const storedPoints = Number(window.localStorage.getItem(POINTS_STORAGE_KEY) ?? '0');
    const storedStreak = Number(window.localStorage.getItem(STREAK_STORAGE_KEY) ?? '0');

    setProgress(storedProgress[slug] ?? 0);
    setFinished(Boolean(storedFinished[slug]));
    setPoints(storedPoints);
    setStreak(storedStreak);

    const dailyViews = readJSON<Record<string, boolean>>(DAILY_VIEW_STORAGE_KEY, {});
    const today = new Date().toISOString().slice(0, 10);
    if (!dailyViews[today]) {
      dailyViews[today] = true;
      writeJSON(DAILY_VIEW_STORAGE_KEY, dailyViews);
      const nextPoints = storedPoints + 1;
      window.localStorage.setItem(POINTS_STORAGE_KEY, String(nextPoints));
      setPoints(nextPoints);
      window.dispatchEvent(new Event('learnflow-rewards'));
    }
  }, [slug]);

  const persistProgress = useCallback((value: number) => {
    if (typeof window === 'undefined') return;
    const map = readJSON<ProgressMap>(PROGRESS_STORAGE_KEY, {});
    map[slug] = value;
    writeJSON(PROGRESS_STORAGE_KEY, map);
  }, [slug]);

  const persistFinished = useCallback(() => {
    if (typeof window === 'undefined') return;
    const map = readJSON<FinishedMap>(FINISHED_STORAGE_KEY, {});
    map[slug] = true;
    writeJSON(FINISHED_STORAGE_KEY, map);
  }, [slug]);

  const updateProgress = useCallback(
    (nextValue: number) => {
      const clamped = Math.min(100, Math.max(0, nextValue));
      setProgress(clamped);
      persistProgress(clamped);
    },
    [persistProgress]
  );

  const markFinished = useCallback(() => {
    if (finished) return;
    setFinished(true);
    persistFinished();
    updateProgress(100);

    if (typeof window !== 'undefined') {
      const currentPoints = Number(window.localStorage.getItem(POINTS_STORAGE_KEY) ?? '0');
      const newPoints = currentPoints + 10;
      window.localStorage.setItem(POINTS_STORAGE_KEY, String(newPoints));
      setPoints(newPoints);

      const today = new Date().toISOString().slice(0, 10);
      const lastFinish = window.localStorage.getItem(LAST_FINISH_STORAGE_KEY);
      let newStreak = 1;
      if (lastFinish) {
        const previousDate = new Date(lastFinish);
        const todayDate = new Date(today);
        const diff = Math.round((todayDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) {
          newStreak = Number(window.localStorage.getItem(STREAK_STORAGE_KEY) ?? '1');
        } else if (diff === 1) {
          newStreak = Number(window.localStorage.getItem(STREAK_STORAGE_KEY) ?? '0') + 1;
        }
      }
      window.localStorage.setItem(STREAK_STORAGE_KEY, String(newStreak));
      window.localStorage.setItem(LAST_FINISH_STORAGE_KEY, today);
      setStreak(newStreak);
      window.dispatchEvent(new Event('learnflow-rewards'));
    }

    logEvent('finish_summary', slug);
  }, [finished, persistFinished, updateProgress, slug]);

  return {
    progress,
    finished,
    points,
    streak,
    updateProgress,
    markFinished
  };
}
