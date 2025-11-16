import Link from 'next/link';
import { getSummaries } from '@/lib/summaries';
import { CoverCard } from '@/components/CoverCard';
import { DailyBanner } from '@/components/DailyBanner';
import { RewardsPanel } from '@/components/RewardsPanel';
import { EventLogger } from '@/components/EventLogger';

export default async function HomePage() {
  const summaries = await getSummaries();

  return (
    <div className="space-y-10">
      <EventLogger eventType="view_home" />
      <section className="rounded-3xl bg-gradient-to-l from-brand-violet to-brand-coral p-8 text-right text-white shadow-card">
        <p className="text-sm">מסע למידה חדש</p>
        <h1 className="mt-2 text-3xl font-bold">LearnFlow מזמינה אותך לקרוא סיפורים מקוריים באנגלית</h1>
        <p className="mt-4 text-base leading-relaxed">
          כל סיפור הוא תקציר נרטיבי של 12–15 דקות עם שפה ידידותית (B1-B2), כריכה ייחודית, וטיפים לשילוב בחיים. הממשק עוברי,
          התוכן באנגלית, ואת ההתקדמות שומרים מקומית.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/onboarding"
            className="rounded-full bg-white/95 px-6 py-3 text-base font-semibold text-slate-900"
          >
            התחילי בהכוונה
          </Link>
          <Link
            href="/#feed"
            className="rounded-full border border-white/70 px-6 py-3 text-base font-semibold text-white"
          >
            דלגי לפיד הסיפורים
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <DailyBanner />
        <RewardsPanel />
      </section>

      <section id="feed" className="space-y-5">
        <div className="flex items-center justify-between text-right">
          <div>
            <p className="text-sm text-slate-500">נרטיבים בני 12–15 דקות</p>
            <h2 className="text-2xl font-semibold">בחרי את הסיפור הבא</h2>
          </div>
          <Link href="/about" className="text-sm text-brand-teal">
            למה LearnFlow? →
          </Link>
        </div>
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {summaries.map((summary) => (
            <CoverCard key={summary.id} summary={summary} />
          ))}
        </div>
      </section>
    </div>
  );
}
