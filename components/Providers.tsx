'use client';

import { ThemeProvider } from 'next-themes';
import { PropsWithChildren, useEffect } from 'react';
import { ensureSessionId } from '@/lib/session';

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    ensureSessionId();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="learnflow_theme"
    >
      {children}
    </ThemeProvider>
  );
}
