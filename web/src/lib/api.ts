import { unstable_cache } from 'next/cache';
import type { CaseStudy, SiteData } from './types';

const API_URL = process.env.API_INTERNAL_URL || 'http://localhost:8080';

/** Cache tag cleared by /internal/revalidate whenever content changes in the admin. */
export const SITE_TAG = 'site';

async function fetchJson<T>(path: string): Promise<T | null> {
  // Not "no-store": that would make every page dynamic. Only 200 responses are cached,
  // under the same tag that /internal/revalidate clears.
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600, tags: [SITE_TAG] } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
  return (await res.json()) as T;
}

export const getSite = unstable_cache(
  async () => {
    const site = await fetchJson<SiteData>('/api/public/site');
    if (!site) throw new Error('Site content not found');
    return site;
  },
  ['site'],
  { tags: [SITE_TAG], revalidate: 3600 },
);

export function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return unstable_cache(
    () => fetchJson<CaseStudy>(`/api/public/case-studies/${encodeURIComponent(slug)}`),
    ['case-study', slug],
    { tags: [SITE_TAG], revalidate: 3600 },
  )();
}
