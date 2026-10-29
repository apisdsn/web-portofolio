import { getCaseStudy, getSite } from '@/lib/api';
import { displayHost, OG_SIZE, renderOgImage } from '@/lib/og';
import { SITE_URL } from '@/lib/seo';
import { isLang, tr } from '@/lib/types';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Case study';
export const revalidate = 3600;

export default async function Image({ params }: { params: { lang: string; slug: string } }) {
  const lang = isLang(params.lang) ? params.lang : 'id';
  const [{ profile }, caseStudy] = await Promise.all([getSite(), getCaseStudy(params.slug)]);
  return renderOgImage({
    logo: profile.logoText,
    eyebrow: 'Case study',
    title: caseStudy ? tr(caseStudy.title, lang) : profile.fullName,
    subtitle: caseStudy ? `${profile.fullName} · ${caseStudy.organization}` : undefined,
    footer: displayHost(SITE_URL),
    tags: caseStudy?.tags,
    accent: profile.accentColor,
  });
}
