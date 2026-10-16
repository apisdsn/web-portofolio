import Link from 'next/link';
import type { Lang } from '@/lib/types';
import { ui } from '@/lib/i18n';

interface Props {
  lang: Lang;
  /** Path after the language prefix, used for the language switch ("" on home). */
  path: string;
  /** Text logo from the profile, editable in the admin. */
  logo: string;
}

export function SiteHeader({ lang, path, logo }: Props) {
  const t = ui[lang];
  const home = `/${lang}`;
  const links = [
    { href: `${home}#case-study`, label: t.nav.caseStudy },
    { href: `${home}#experience`, label: t.nav.experience },
    { href: `${home}#projects`, label: t.nav.projects },
    { href: `${home}#skills`, label: t.nav.skills },
  ];

  return (
    <header className="border-b border-line bg-ground">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-6 py-4"
      >
        <Link href={home} className="font-mono text-[15px] font-semibold">
          {logo}
        </Link>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px]">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hidden hover:text-accent sm:inline">
              {link.label}
            </a>
          ))}
          <div
            role="group"
            aria-label={t.languageGroup}
            className="flex overflow-hidden rounded-md border border-[#B9BDB6] font-mono text-[13px] font-semibold"
          >
            {(['id', 'en'] as const).map((code) => {
              const active = code === lang;
              return (
                <Link
                  key={code}
                  href={`/${code}${path}`}
                  hrefLang={code}
                  aria-current={active ? 'true' : undefined}
                  className={`flex min-h-10 min-w-11 items-center justify-center ${
                    active ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-chip'
                  }`}
                >
                  {code.toUpperCase()}
                </Link>
              );
            })}
          </div>
          <a
            href={`${home}#contact`}
            className="inline-flex min-h-10 items-center rounded-md border border-ink px-4 font-medium"
          >
            {t.nav.contact}
          </a>
        </div>
      </nav>
      {/* Phones: the section links don't fit in the top bar, so they get their own swipeable row */}
      <nav aria-label={t.sectionsNav} className="border-t border-line sm:hidden">
        <ul className="flex gap-1 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <a
                href={link.href}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-[15px] text-muted hover:bg-chip hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
