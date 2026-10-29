import type { Metadata } from 'next';
import { mono, sans } from '@/lib/fonts';
import { baseMetadata } from '@/lib/seo';
import '../globals.css';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'Admin · Portfolio',
  robots: { index: false, follow: false },
};

// Root layout of the admin dashboard (the public site has its own under [lang]).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
