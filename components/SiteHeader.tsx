'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-slate-50/90 py-4 backdrop-blur dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-200">
          <Link href="/">בית</Link>
          <Link href="/onboarding">הכוונה</Link>
          <Link href="/about">אודות</Link>
        </nav>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs text-slate-500">LearnFlow</p>
            <p className="font-semibold">לומדות סיפורים</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
