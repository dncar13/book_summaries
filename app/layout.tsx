import type { Metadata } from 'next';
import { Heebo, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { SiteHeader } from '@/components/SiteHeader';

const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-heebo', weight: ['400', '500', '700'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '600'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://learnflow.local';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'LearnFlow — סיפורי למידה מקוריים',
  description:
    'LearnFlow הוא בית לסיפורי לימוד באנגלית עם ממשק עברי. כל סיכום הוא חוויה קלילה של 12–15 דקות עם כריכות מקוריות.',
  openGraph: {
    title: 'LearnFlow',
    description: 'חוויית למידה לנשים דוברות עברית שרוצות אנגלית חיה.',
    url: siteUrl,
    siteName: 'LearnFlow',
    locale: 'he_IL',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-slate-50 font-heebo text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Providers>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 pb-10 text-right text-xs text-slate-500">
            <p>© {new Date().getFullYear()} LearnFlow — כל הטקסטים והכריכות מקוריים.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
