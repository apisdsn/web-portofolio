import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AvatarBubble } from '@/components/site/AvatarBubble';
import { Section } from '@/components/site/Section';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getSite } from '@/lib/api';
import { formatPeriod, ui } from '@/lib/i18n';
import { absoluteUrl, jsonLd } from '@/lib/seo';
import { isLang, mediaUrl, tr, type Lang, type SiteData } from '@/lib/types';

// Cached HTML, re-rendered at most once a minute (and right away after an admin change, see
// /internal/revalidate). The 60 s also becomes "s-maxage=60" for Cloudflare's edge cache.
export const revalidate = 60;

type Params = { params: { lang: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!isLang(params.lang)) return {};
  const { profile } = await getSite();
  const title = tr(profile.seoTitle, params.lang);
  const description = tr(profile.seoDescription, params.lang);
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${params.lang}`,
      languages: { id: '/id', en: '/en', 'x-default': '/' },
    },
    // og:image comes from opengraph-image.tsx in this folder
    openGraph: {
      type: 'profile',
      url: `/${params.lang}`,
      siteName: profile.fullName,
      title,
      description,
      locale: params.lang === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: params.lang === 'id' ? 'en_US' : 'id_ID',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** schema.org Person, so search engines can show the name, role and profiles. */
function personJsonLd(site: SiteData, lang: Lang) {
  const { profile } = site;
  const current = site.experiences.find((e) => e.current) ?? site.experiences[0];
  const photo = mediaUrl(profile.photoMediaId);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.fullName,
    url: absoluteUrl(`/${lang}`),
    image: photo ? absoluteUrl(photo) : undefined,
    description: tr(profile.seoDescription, lang),
    jobTitle: current ? tr(current.role, lang) : undefined,
    worksFor: current?.current ? { '@type': 'Organization', name: current.organization } : undefined,
    address: profile.location
      ? { '@type': 'PostalAddress', addressLocality: profile.location }
      : undefined,
    alumniOf: site.education.map((e) => ({ '@type': 'EducationalOrganization', name: e.institution })),
    knowsAbout: site.skillGroups
      .flatMap((g) => tr(g.items, lang).split('·'))
      .map((s) => s.trim())
      .filter(Boolean),
    sameAs: [profile.linkedinUrl, profile.githubUrl].filter(Boolean),
  };
}

export default async function HomePage({ params }: Params) {
  if (!isLang(params.lang)) return notFound();
  const lang = params.lang as Lang;
  const t = ui[lang];
  const site = await getSite();
  const { profile } = site;

  const featured = site.caseStudies.find((c) => c.featured) ?? site.caseStudies[0];
  const otherCaseStudies = site.caseStudies.filter((c) => c !== featured);
  const initials = profile.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  const cvUrl = mediaUrl(profile.cvMediaId);
  const caseStudySlugs = new Set(site.caseStudies.map((c) => c.slug));

  return (
    <div style={{ '--accent': profile.accentColor } as React.CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personJsonLd(site, lang)) }} />
      <SiteHeader lang={lang} path="" logo={profile.logoText} />

      <main id="top">
        {/* flex-wrap-reverse flips the cross axis, so items-end means "top": the photo circle
            (84px below the status bubble) lines up with the headline instead of the block's middle */}
        <section className="mx-auto flex max-w-page flex-wrap-reverse items-end gap-12 px-6 pb-20 pt-16 sm:pt-24">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
            <p className="font-mono text-[13px] text-muted">{profile.location} · WIB (UTC+7)</p>
            <p className="text-lg font-semibold">{profile.fullName}</p>
            <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[56px]">
              {tr(profile.headline, lang)}
            </h1>
            <p className="max-w-[640px] text-[17px] leading-relaxed text-muted sm:text-[19px]">
              {tr(profile.subHeadline, lang)}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {featured ? (
                <Link
                  href={`/${lang}/case-study/${featured.slug}`}
                  className="inline-flex min-h-12 items-center rounded-md bg-ink px-6 font-semibold text-white hover:bg-black"
                >
                  {t.readCaseStudy}
                </Link>
              ) : null}
              <a
                href="#contact"
                className="inline-flex min-h-12 items-center rounded-md border border-[#B9BDB6] px-6 font-medium hover:border-ink"
              >
                {t.contactMe}
              </a>
            </div>
          </div>
          {/* Full width (centred) while stacked on small screens; its own column from lg */}
          <div className="flex w-full justify-center lg:w-auto lg:flex-none">
            <AvatarBubble
              src={mediaUrl(profile.photoMediaId)}
              alt={t.photoAlt(profile.fullName)}
              status={tr(profile.statusText, lang)}
              initials={initials}
            />
          </div>
        </section>

        {featured ? (
          <Section id="case-study" number="01" title={t.sections.caseStudies}>
            <article className="flex flex-wrap gap-10 rounded-[10px] border border-line bg-surface p-6 sm:p-10">
              <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-4">
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {featured.tags.map((tag) => (
                    <span key={tag} className="rounded bg-chip px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-semibold leading-tight sm:text-[28px]">{tr(featured.title, lang)}</h3>
                <p className="text-[17px] leading-relaxed text-muted">{tr(featured.summary, lang)}</p>
                <Link
                  href={`/${lang}/case-study/${featured.slug}`}
                  className="inline-flex min-h-11 items-center self-start font-semibold text-accent"
                >
                  {t.readMore}
                </Link>
              </div>
              {featured.metrics.length > 0 ? (
                <div className="flex flex-[1_1_280px] flex-col gap-3">
                  {featured.metrics.slice(0, 2).map((metric, i) => (
                    <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-line p-5">
                      <span className="text-[13px] text-muted">{tr(metric.label, lang)}</span>
                      <span className="font-mono text-xl font-semibold">{metric.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>

            {otherCaseStudies.length > 0 ? (
              <div className="flex flex-wrap gap-6">
                {otherCaseStudies.map((cs) => (
                  <Link
                    key={cs.id}
                    href={`/${lang}/case-study/${cs.slug}`}
                    className="flex flex-[1_1_320px] flex-col gap-3 rounded-[10px] border border-line bg-surface p-7 hover:border-ink"
                  >
                    <span className="font-mono text-xs text-muted">{cs.tags.join(' · ')}</span>
                    <h3 className="text-[21px] font-semibold leading-snug">{tr(cs.title, lang)}</h3>
                    <p className="leading-relaxed text-muted">{tr(cs.summary, lang)}</p>
                  </Link>
                ))}
              </div>
            ) : null}
          </Section>
        ) : null}

        {site.experiences.length > 0 ? (
          <Section id="experience" number="02" title={t.sections.experience}>
            <ol className="flex flex-col">
              {site.experiences.map((exp) => (
                <li key={exp.id} className="flex flex-wrap gap-x-10 gap-y-3 border-t border-line py-7">
                  <span className="flex-[0_0_200px] pt-1 font-mono text-sm text-muted">{formatPeriod(exp, lang)}</span>
                  <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-2.5">
                    <h3 className="text-[21px] font-semibold">{tr(exp.role, lang)}</h3>
                    <p className="text-[15px] font-medium text-muted">{exp.organization}</p>
                    <p className="leading-relaxed">{tr(exp.description, lang)}</p>
                    {exp.stack.length > 0 ? (
                      <p className="font-mono text-[13px] text-muted">{exp.stack.join(' · ')}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {site.projects.length > 0 ? (
          <Section id="projects" number="03" title={t.sections.projects}>
            <div className="flex flex-wrap gap-6">
              {site.projects.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-[1_1_320px] flex-col gap-3.5 rounded-[10px] border border-line bg-surface p-7"
                >
                  <span className="font-mono text-xs text-muted">{tr(project.tag, lang)}</span>
                  <h3 className="font-mono text-[19px] font-semibold">{project.name}</h3>
                  <p className="flex-grow text-[15px] leading-relaxed text-muted">{tr(project.description, lang)}</p>
                  <div className="flex flex-wrap items-center gap-x-5 text-[15px] font-medium">
                    {caseStudySlugs.has(project.slug) ? (
                      <Link href={`/${lang}/case-study/${project.slug}`} className="inline-flex min-h-11 items-center text-accent hover:underline">
                        {t.caseStudyLink}
                      </Link>
                    ) : null}
                    {project.repoUrl ? (
                      <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center hover:text-accent">
                        {t.repo}
                      </a>
                    ) : null}
                    {project.demoUrl ? (
                      <a href={project.demoUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center hover:text-accent">
                        {t.demo}
                      </a>
                    ) : null}
                    {!project.repoUrl && !project.demoUrl ? (
                      <span
                        title={t.privateCodeHint}
                        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[13px] font-normal text-muted"
                      >
                        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="3" y="7" width="10" height="7" rx="1.5" />
                          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                        </svg>
                        {t.privateCode}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </Section>
        ) : null}

        {site.skillGroups.length > 0 ? (
          <Section id="skills" number="04" title={t.sections.skills}>
            <dl className="flex flex-wrap gap-x-12">
              {site.skillGroups.map((group) => (
                <div key={group.id} className="flex flex-[1_1_440px] flex-col gap-1.5 border-t border-line py-4">
                  <dt className="text-sm text-muted">{tr(group.label, lang)}</dt>
                  <dd className="font-medium leading-relaxed">{tr(group.items, lang)}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {site.education.length > 0 || site.certifications.length > 0 ? (
          <Section id="education" number="05" title={t.sections.education}>
            <div className="flex flex-wrap gap-6">
              {site.education.map((edu) => (
                <article
                  key={edu.id}
                  className="flex flex-[1_1_420px] flex-col gap-2.5 rounded-[10px] border border-line bg-surface p-7"
                >
                  <span className="font-mono text-[13px] text-muted">
                    {edu.startYear}
                    {edu.endYear ? ` – ${edu.endYear}` : ''}
                    {edu.gpa ? ` · ${t.gpa} ${lang === 'id' ? edu.gpa.replace('.', ',') : edu.gpa}` : ''}
                  </span>
                  <h3 className="text-[21px] font-semibold">{tr(edu.degree, lang)}</h3>
                  <p className="text-[15px] font-medium text-muted">{edu.institution}</p>
                  <p className="text-[15px] leading-relaxed">{tr(edu.thesis, lang)}</p>
                </article>
              ))}
              {site.certifications.length > 0 ? (
                <div className="flex flex-[1_1_420px] flex-col">
                  <h3 className="mb-2 text-[15px] font-semibold text-muted">{t.sections.certifications}</h3>
                  <ul>
                    {site.certifications.map((cert) => (
                      <li key={cert.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-line py-3.5">
                        <span className="flex-[1_1_260px] text-[15px] font-medium">{tr(cert.name, lang)}</span>
                        <span className="font-mono text-[13px] text-muted">
                          {cert.issuer} · {cert.year}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        <section id="contact" className="scroll-mt-4 border-t border-line">
          <div className="mx-auto max-w-page px-6 py-16 sm:py-20">
            <div className="flex flex-wrap items-center justify-between gap-8 rounded-xl bg-ink p-8 text-ground sm:p-12">
              <div className="flex flex-[999_1_420px] flex-col gap-3">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.letsTalk}</h2>
                <p className="text-[17px] leading-relaxed text-[#C9CDC5]">{tr(profile.contactText, lang)}</p>
                <p className="font-mono text-[15px] text-[#C9CDC5]">{profile.email}</p>
              </div>
              <div className="flex flex-[1_1_280px] flex-wrap gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex min-h-12 items-center rounded-md bg-ground px-5 font-semibold text-ink hover:bg-white"
                >
                  {t.sendEmail}
                </a>
                {profile.linkedinUrl ? (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-md border border-[#8A9088] px-5 hover:border-white">
                    LinkedIn
                  </a>
                ) : null}
                {profile.githubUrl ? (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-md border border-[#8A9088] px-5 hover:border-white">
                    GitHub
                  </a>
                ) : null}
                {cvUrl ? (
                  <a href={cvUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-md border border-[#8A9088] px-5 hover:border-white">
                    {t.downloadCv}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-page flex-wrap justify-between gap-3 px-6 py-7 font-mono text-[13px] text-muted">
          <span>
            © {new Date().getFullYear()} {profile.fullName}
          </span>
          <span>{profile.location}</span>
        </div>
      </footer>
    </div>
  );
}
