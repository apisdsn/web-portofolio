import type { Metadata } from 'next';
import { mono, sans } from '@/lib/fonts';
import { baseMetadata } from '@/lib/seo';
import { isLang, LANGS } from '@/lib/types';
import '../globals.css';

// Root layout of the public site. It sits under [lang] so <html lang> comes from the URL
// instead of a request header, which lets the pages be cached as static HTML.

export const metadata: Metadata = {
  ...baseMetadata,
  title: { default: 'Hafiz Adha Febrian', template: '%s — Hafiz Adha Febrian' },
};

// Pages are rendered on the first request and then cached; nothing is fetched at build
// time, because the API is not running while the Docker image is built.
export const dynamicParams = true;
export function generateStaticParams() {
  return [] as { lang: (typeof LANGS)[number] }[];
}

export default function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = isLang(params.lang) ? params.lang : 'id';
  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
