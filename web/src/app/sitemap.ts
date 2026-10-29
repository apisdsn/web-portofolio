import type { MetadataRoute } from 'next';
import { getCaseStudy, getSite } from '@/lib/api';
import { absoluteUrl } from '@/lib/seo';
import { LANGS, type SiteData } from '@/lib/types';

// Built per request from the cached site data (the API is not reachable while the image is built).
export const dynamic = 'force-dynamic';

function latest(dates: (string | undefined)[]): Date | undefined {
  const times = dates.filter(Boolean).map((d) => new Date(d as string).getTime());
  return times.length ? new Date(Math.max(...times)) : undefined;
}

function entries(path: string, lastModified: Date | undefined, priority: number): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LANGS.map((l) => [l, absoluteUrl(`/${l}${path}`)]));
  return LANGS.map((lang) => ({
    url: absoluteUrl(`/${lang}${path}`),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let site: SiteData;
  try {
    site = await getSite();
  } catch {
    // API down: still list the home pages rather than failing the whole file
    return entries('', undefined, 1);
  }

  const homeUpdated = latest([
    site.profile.updatedAt,
    ...site.experiences.map((e) => e.updatedAt),
    ...site.projects.map((p) => p.updatedAt),
    ...site.skillGroups.map((g) => g.updatedAt),
    ...site.education.map((e) => e.updatedAt),
    ...site.certifications.map((c) => c.updatedAt),
  ]);

  const caseStudies = await Promise.all(
    site.caseStudies.map(async (summary) => {
      const full = await getCaseStudy(summary.slug).catch(() => null);
      return entries(`/case-study/${summary.slug}`, latest([full?.updatedAt]), 0.8);
    }),
  );

  return [...entries('', homeUpdated, 1), ...caseStudies.flat()];
}
