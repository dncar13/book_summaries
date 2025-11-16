'use client';

import { useEffect, useState } from 'react';
import { PACE_STORAGE_KEY } from '@/lib/session';

export function DailyBanner() {
  const [pace, setPace] = useState(3);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedPace = Number(window.localStorage.getItem(PACE_STORAGE_KEY) ?? '3');
    setPace(storedPace);
  }, []);

  const minutes = pace * 13;

  return (
    <div className="rounded-3xl bg-gradient-to-l from-brand-violet to-brand-teal p-5 text-white shadow-card">
      <p className="text-sm">משימת היום: סיפור אחד</p>
      <p className="text-2xl font-semibold">נותרו בערך {minutes} דקות להשלים השבוע</p>
      <p className="text-sm opacity-80">תני לעצמך חלון קצר כבר עכשיו.</p>
    </div>
  );
}
