/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getSummaryBySlug } from '@/lib/summaries';

export const runtime = 'edge';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const summary = await getSummaryBySlug(params.slug);
  if (!summary) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: '#0f172a',
            color: '#fff',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          LearnFlow
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const coverData = `data:image/svg+xml;base64,${Buffer.from(summary.cover_svg).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row-reverse',
          background: 'linear-gradient(135deg,#7f7fd5,#86a8e7)',
          color: '#fff',
          padding: '60px',
          fontFamily: 'Heebo'
        }}
      >
        <div
          style={{
            width: '40%',
            height: '100%',
            borderRadius: '40px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(15,23,42,0.3)',
            backgroundColor: '#fff'
          }}
        >
          <img src={coverData} alt={summary.title_en} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '40px' }}>
          <p style={{ fontSize: 32 }}>סיפור של {summary.minutes_estimated} דקות</p>
          <h1 style={{ fontSize: 70, lineHeight: 1, margin: 0 }}>{summary.title_en}</h1>
          <p style={{ fontSize: 32 }}>{summary.author_en}</p>
          <p style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)' }}>{summary.tldr_he.split('\n')[0]}</p>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
