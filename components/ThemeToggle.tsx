'use client';

import { SunIcon, MoonIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { logEvent } from '@/lib/eventClient';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const statusRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    logEvent('toggle_theme');
    if (statusRef.current) {
      statusRef.current.textContent = `עודכן למצב ${next === 'light' ? 'בהיר' : 'כהה'}`;
    }
  };

  if (!mounted) {
    return (
      <button
        aria-label="החלפת מצב תאורה"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
      >
        …
      </button>
    );
  }

  const isLight = theme === 'light';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        aria-label="החלפת מצב תאורה"
        className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:border-brand-teal/70 hover:text-brand-teal dark:border-slate-700 dark:text-slate-100"
      >
        {isLight ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        <span>{isLight ? 'מצב בהיר' : 'מצב כהה'}</span>
      </button>
      <span ref={statusRef} role="status" aria-live="polite" className="sr-only"></span>
    </div>
  );
}
