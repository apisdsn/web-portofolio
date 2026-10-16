import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/site/Markdown';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getCaseStudy, getSite } from '@/lib/api';
import { ui } from '@/lib/i18n';
import { isLang, tr, type Lang } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Params = { params: { lang: string; slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!isLang(params.lang)) return {};
  const caseStudy = await getCaseStudy(params.slug);
  if (!caseStudy) return {};
  return {
    title: tr(caseStudy.title, params.lang),
    description: tr(caseStudy.summary, params.lang),
    alternates: {
      languages: { id: `/id/case-study/${caseStudy.slug}`, en: `/en/case-study/${caseStudy.slug}` },
    },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  if (!isLang(params.lang)) return notFound();
  const lang = params.lang as Lang;
  const t = ui[lang];
  const [caseStudy, site] = await Promise.all([getCaseStudy(params.slug), getSite()]);
  if (!caseStudy) return notFound();

  const others = site.caseStudies.filter((c) => c.slug !== caseStudy.slug);
  const next = others[0];

  const meta = [
    { label: t.role, value: tr(caseStudy.role, lang) },
    { label: t.period, value: tr(caseStudy.period, lang) },
    { label: t.company, value: caseStudy.organization },
    { label: 'Stack', value: caseStudy.stack, mono: true },
  ];
  const tldr = [
    { label: t.problem, value: tr(caseStudy.problem, lang) },
    { label: t.approach, value: tr(caseStudy.approach, lang) },
    { label: t.result, value: tr(caseStudy.result, lang) },
  ];

  return (
    <div style={{ '--accent': site.profile.accentColor } as React.CSSProperties}>
      <SiteHeader lang={lang} path={`/case-study/${caseStudy.slug}`} logo={site.profile.logoText} />

      <main className="mx-auto flex max-w-[808px] flex-col gap-14 px-6 pb-24 pt-12">
        <div className="flex flex-col gap-5">
          <Link href={`/${lang}#case-study`} className="inline-flex min-h-11 items-center self-start text-[15px] text-muted hover:text-ink">
            {t.backToCaseStudies}
          </Link>
          <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            {tr(caseStudy.title, lang)}
          </h1>
          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
            {meta.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dt className="text-muted">{item.label}</dt>
                <dd className={`font-medium ${item.mono ? 'font-mono' : ''}`}>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <section aria-label="TL;DR" className="flex flex-col gap-6 rounded-[10px] border border-line bg-surface p-8">
          <span className="font-mono text-[13px] font-semibold text-accent">TL;DR</span>
          <div className="flex flex-wrap gap-7">
            {tldr.map((item) => (
              <div key={item.label} className="flex flex-[1_1_180px] flex-col gap-2">
                <h2 className="text-[15px] font-semibold">{item.label}</h2>
                <p className="text-[15px] leading-normal text-muted">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {caseStudy.metrics.length > 0 ? (
          <section aria-label="Metrics" className="flex flex-wrap gap-4">
            {caseStudy.metrics.map((metric, i) => (
              <div key={i} className="flex flex-[1_1_200px] flex-col gap-1.5 border-t-2 border-ink pt-4">
                <span className="font-mono text-[30px] font-semibold">{metric.value}</span>
                <span className="text-sm text-muted">{tr(metric.label, lang)}</span>
              </div>
            ))}
          </section>
        ) : null}

        <Markdown source={tr(caseStudy.body, lang)} />

        {next ? (
          <Link
            href={`/${lang}/case-study/${next.slug}`}
            className="flex flex-col gap-1.5 rounded-[10px] border border-line bg-surface p-7 hover:border-ink"
          >
            <span className="text-[13px] text-muted">{lang === 'id' ? 'Case study berikutnya' : 'Next case study'}</span>
            <span className="text-xl font-semibold">{tr(next.title, lang)} →</span>
          </Link>
        ) : null}
      </main>
    </div>
  );
}
