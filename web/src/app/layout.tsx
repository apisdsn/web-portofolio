import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { mono, sans } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: 'Hafiz Adha Febrian',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = headers().get('x-site-lang') === 'en' ? 'en' : 'id';
  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
