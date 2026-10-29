import type { Metadata } from 'next';

/** Public address of the site, e.g. https://apisdsn.com (no trailing slash). */
export const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Shared by both root layouts (public site and admin). Files live in web/public. */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

/**
 * Serialises JSON-LD for a <script> tag. "<" is escaped so content edited in the admin
 * can never close the script element.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
