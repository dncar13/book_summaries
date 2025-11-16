'use client';

import { useEffect, useState } from 'react';
import {
  ONBOARDING_STORAGE_KEY,
  PACE_STORAGE_KEY,
  getBrowserSafeWindow
} from '@/lib/session';
import { logEvent } from '@/lib/eventClient';

const paceOptions = [
  { value: 1, label: 'סיפור אחד בשבוע' },
  { value: 3, label: 'שלושה סיפורים בשבוע' },
  { value: 5, label: 'חמישה סיפורים בשבוע' }
];

export function OnboardingSteps() {
  const [step, setStep] = useState(1);
  const [pace, setPace] = useState<number>(3);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const win = getBrowserSafeWindow();
    if (!win) return;
    const storedPace = Number(win.localStorage.getItem(PACE_STORAGE_KEY) ?? '3');
    setPace(storedPace);
    if (win.localStorage.getItem(ONBOARDING_STORAGE_KEY)) {
      setCompleted(true);
    }
    logEvent('start_onboarding');
  }, []);

  const handleFinish = () => {
    const win = getBrowserSafeWindow();
    if (!win) return;
    win.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    win.localStorage.setItem(PACE_STORAGE_KEY, String(pace));
    setCompleted(true);
    logEvent('finish_onboarding');
  };

  if (completed) {
    return (
      <div className="rounded-3xl bg-emerald-100/80 p-6 text-right text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
        <p className="text-lg font-semibold">👏 כבר סיימת את ההכוונה</p>
        <p className="text-sm">אפשר לשנות קצב בכל רגע מתוך תפריט המשימה היומית.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      {step === 1 ? (
        <div className="rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-black/5 dark:bg-slate-900/70">
          <p className="text-sm text-slate-500">שלב 1 מתוך 2</p>
          <h2 className="mt-2 text-2xl font-semibold">ברוכה הבאה אל LearnFlow</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            תרגול יומי קצר עם סיפורים מקוריים באנגלית ילמד אותך אוצר מילים וקבלת החלטות. כל סיפור הוא מסע בן
            12–15 דקות הכולל TL;DR בעברית וטיפים מעשיים.
          </p>
          <button
            onClick={() => setStep(2)}
            className="mt-6 w-full rounded-full bg-slate-900 py-3 text-base font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
          >
            המשך לשלב הבא
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-black/5 dark:bg-slate-900/70">
          <p className="text-sm text-slate-500">שלב 2 מתוך 2</p>
          <h2 className="mt-2 text-2xl font-semibold">בחרי קצב קריאה</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            הסיפורים נבנים כסדרה שבועית. אפשר להתחיל לאט ולעלות קצב בהמשך.
          </p>
          <div className="mt-4 space-y-3">
            {paceOptions.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-brand-violet/60 dark:border-slate-700">
                <span>{option.label}</span>
                <input
                  type="radio"
                  name="pace"
                  value={option.value}
                  checked={pace === option.value}
                  onChange={() => setPace(option.value)}
                  className="h-4 w-4"
                />
              </label>
            ))}
          </div>
          <button
            onClick={handleFinish}
            className="mt-6 w-full rounded-full bg-brand-violet py-3 text-base font-semibold text-white transition hover:bg-brand-coral"
          >
            להתחיל את הזרימה
          </button>
        </div>
      )}
    </div>
  );
}
