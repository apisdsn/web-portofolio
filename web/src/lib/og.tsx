import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

// Read from disk at request time; the Dockerfile copies src/assets next to server.js.
const fontDir = join(process.cwd(), 'src/assets/fonts');
let fonts: Promise<{ sans: Buffer; mono: Buffer }> | null = null;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(fontDir, 'InstrumentSans-600.ttf')),
    readFile(join(fontDir, 'JetBrainsMono-500.ttf')),
  ]).then(([sans, mono]) => ({ sans, mono }));
  return fonts;
}

interface Card {
  /** Small monospace line at the top, e.g. "~/apisdsn" */
  logo: string;
  /** Label above the title, e.g. "Case study" */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Bottom line, e.g. the site address */
  footer: string;
  tags?: string[];
  accent: string;
}

/** The 1200×630 preview shown when a link to the site is shared (LinkedIn, WhatsApp, X…). */
export async function renderOgImage(card: Card) {
  const { sans, mono } = await loadFonts();
  const titleSize = card.title.length > 90 ? 50 : card.title.length > 60 ? 58 : 68;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#F3F4F1',
          color: '#15171A',
          fontFamily: 'Instrument Sans',
          borderTop: `14px solid ${card.accent}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 30 }}>{card.logo}</span>
          {card.eyebrow ? (
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 24,
                color: card.accent,
                border: `2px solid ${card.accent}`,
                borderRadius: 999,
                padding: '6px 20px',
              }}
            >
              {card.eyebrow}
            </span>
          ) : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: titleSize, lineHeight: 1.08, letterSpacing: '-0.02em' }}>{card.title}</div>
          {card.subtitle ? (
            <div style={{ fontSize: 30, color: '#565B62', lineHeight: 1.3 }}>{card.subtitle}</div>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, color: '#565B62' }}>{card.footer}</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {(card.tags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 20,
                  background: '#E8EBE6',
                  borderRadius: 8,
                  padding: '6px 14px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Instrument Sans', data: sans, weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 500, style: 'normal' },
      ],
    },
  );
}

/** "https://apisdsn.com" → "apisdsn.com" */
export function displayHost(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
