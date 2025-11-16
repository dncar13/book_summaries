import type { MetadataRoute } from 'next';
import { getSummaries } from '@/lib/summaries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://learnflow.local';
  const summaries = await getSummaries();
  const summaryEntries = summaries.map((summary) => ({
    url: `${base}/summary/${summary.slug}`,
    lastModified: summary.created_at ? new Date(summary.created_at) : new Date()
  }));

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/onboarding`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    ...summaryEntries
  ];
}
