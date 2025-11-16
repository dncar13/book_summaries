import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://learnflow.local';
  return new NextResponse(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
