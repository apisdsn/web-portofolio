'use client';

import { useParams } from 'next/navigation';
import { ui } from '@/lib/i18n';

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ lang: string }>();
  const t = ui[params?.lang === 'en' ? 'en' : 'id'];
  return (
    <main className="mx-auto flex min-h-screen max-w-page flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">{t.errorTitle}</h1>
      <p className="text-muted">{t.errorBody}</p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 font-semibold text-white"
      >
        {t.retry}
      </button>
    </main>
  );
}
