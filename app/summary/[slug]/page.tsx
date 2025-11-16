import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSummaryBySlug, getSummaries } from '@/lib/summaries';
import { SummaryReader } from '@/components/SummaryReader';
import { EventLogger } from '@/components/EventLogger';

interface SummaryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const summaries = await getSummaries();
  return summaries.map((summary) => ({ slug: summary.slug }));
}

export async function generateMetadata({ params }: SummaryPageProps): Promise<Metadata> {
  const summary = await getSummaryBySlug(params.slug);
  if (!summary) {
    return {
      title: 'סיפור לא נמצא',
      description: 'הסיפור שחיפשת לא קיים במאגר LearnFlow.'
    };
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://learnflow.local';
  const canonical = `${base}/summary/${summary.slug}`;

  return {
    title: `${summary.title_en} — LearnFlow`,
    description: `${summary.title_en} הוא סיפור למידה של ${summary.minutes_estimated} דקות שנכתב במיוחד ללומדות LearnFlow.`,
    alternates: { canonical },
    openGraph: {
      title: summary.title_en,
      description: summary.tldr_he.replace(/\n/g, ' '),
      url: canonical,
      images: [{ url: `${base}/api/og/${summary.slug}` }]
    }
  };
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const summary = await getSummaryBySlug(params.slug);
  if (!summary) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <EventLogger eventType="view_summary" summarySlug={summary.slug} />
      <SummaryReader summary={summary} />
    </div>
  );
}
