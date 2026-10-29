import { getSite } from '@/lib/api';
import { displayHost, OG_SIZE, renderOgImage } from '@/lib/og';
import { SITE_URL } from '@/lib/seo';
import { isLang, tr } from '@/lib/types';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Hafiz Adha Febrian — Backend Developer';
export const revalidate = 3600;

export default async function Image({ params }: { params: { lang: string } }) {
  const lang = isLang(params.lang) ? params.lang : 'id';
  const { profile } = await getSite();
  return renderOgImage({
    logo: profile.logoText,
    title: profile.fullName,
    subtitle: tr(profile.headline, lang),
    footer: displayHost(SITE_URL),
    accent: profile.accentColor,
  });
}
