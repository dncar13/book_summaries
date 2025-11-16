import clsx from 'classnames';

const palettes = [
  ['#0fb981', '#0aa37a', '#b6f3de'],
  ['#f7b733', '#fc4a1a', '#ffe29a'],
  ['#7f7fd5', '#86a8e7', '#91eae4'],
  ['#ff9a9e', '#fad0c4', '#fad390'],
  ['#1b9cfc', '#55efc4', '#ffeaa7'],
  ['#a29bfe', '#6c5ce7', '#fdcb6e'],
  ['#ffb347', '#ffcc33', '#ffd194'],
  ['#2ed573', '#1e90ff', '#3742fa']
];

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return () => {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return ((h < 0 ? ~h + 1 : h) % 1000) / 1000;
  };
}

function pick<T>(items: T[], rand: () => number) {
  return items[Math.floor(rand() * items.length)];
}

interface GeneratedCoverProps {
  seed: string;
  title: string;
  className?: string;
}

export function buildCoverSvg({ seed, title }: { seed: string; title: string }) {
  const rand = seededRandom(seed);
  const palette = pick(palettes, rand);
  const [primary, secondary, accent] = palette;
  const gradientId = `grad-${seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const shapes = Array.from({ length: 3 }).map((_, index) => {
    const type = index % 3;
    if (type === 0) {
      const cx = 40 + rand() * 240;
      const cy = 60 + rand() * 200;
      const r = 30 + rand() * 60;
      const opacity = 0.2 + rand() * 0.2;
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="rgba(255,255,255,${opacity.toFixed(2)})" />`;
    }
    if (type === 1) {
      const x1 = rand() * 320;
      const y1 = 220 + rand() * 200;
      const x2 = 320;
      const y2 = y1 - 120 - rand() * 40;
      return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x2.toFixed(1)} 480 L ${x1.toFixed(1)} 480 Z" fill="rgba(0,0,0,0.25)" />`;
    }
    const width = 80 + rand() * 120;
    const height = 50 + rand() * 90;
    const x = rand() * (320 - width);
    const y = rand() * 200;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${width.toFixed(1)}" height="${height.toFixed(1)}" rx="14" fill="rgba(255,255,255,0.18)" />`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480" role="img" aria-label="${title}">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="${50 + rand() * 50}%">
        <stop offset="0%" stop-color="${primary}" />
        <stop offset="100%" stop-color="${secondary}" />
      </linearGradient>
    </defs>
    <rect width="320" height="480" fill="url(#${gradientId})" />
    ${shapes.join('\n')}
    <text x="32" y="430" font-family="Heebo, Inter, sans-serif" font-size="28" fill="${accent}" opacity="0.9">${title.slice(0, 18)}</text>
  </svg>`;
}

export function GeneratedCover({ seed, title, className }: GeneratedCoverProps) {
  const svg = buildCoverSvg({ seed, title });
  return (
    <div
      className={clsx('overflow-hidden rounded-3xl shadow-card ring-1 ring-black/5', className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
