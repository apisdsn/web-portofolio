import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

// Rendered per request: SITE_URL is only set on the server, not when CI builds the image.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/internal/'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
