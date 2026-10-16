'use client';

import { useId, useState } from 'react';
import { Markdown } from '@/components/site/Markdown';
import type { Lang, Localized } from '@/lib/types';
import { FieldShell, inputClass } from './ui';

interface Props {
  label: string;
  help?: string;
  error?: string;
  value: Localized | undefined;
  onChange: (value: Localized) => void;
  mode: 'line' | 'text' | 'markdown';
}

const LANG_LABEL: Record<Lang, string> = { id: 'Bahasa Indonesia', en: 'English' };

/** Side-by-side ID / EN editor that flags a missing translation. */
export function LocalizedField({ label, help, error, value, onChange, mode }: Props) {
  const baseId = useId();
  const [preview, setPreview] = useState(false);
  const current: Localized = value ?? {};

  return (
    <FieldShell label={label} help={help} error={error}>
      {mode === 'markdown' ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreview(false)}
            aria-pressed={!preview}
            className={`rounded px-3 py-1 text-xs font-semibold ${!preview ? 'bg-ink text-white' : 'bg-chip'}`}
          >
            Tulis
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            aria-pressed={preview}
            className={`rounded px-3 py-1 text-xs font-semibold ${preview ? 'bg-ink text-white' : 'bg-chip'}`}
          >
            Pratinjau
          </button>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {(['id', 'en'] as const).map((lang) => {
          const id = `${baseId}-${lang}`;
          const text = current[lang] ?? '';
          const missing = text.trim() === '';
          const update = (next: string) => onChange({ ...current, [lang]: next });
          return (
            <div key={lang} className="flex flex-col gap-1">
              <label htmlFor={id} className="flex items-center gap-2 font-mono text-xs text-muted">
                {LANG_LABEL[lang]}
                {missing ? (
                  <span className="rounded bg-[#FDF3D7] px-1.5 py-0.5 font-sans text-[11px] font-semibold text-[#7A5A00]">
                    belum diisi
                  </span>
                ) : null}
              </label>
              {mode === 'line' ? (
                <input id={id} className={inputClass} value={text} onChange={(e) => update(e.target.value)} />
              ) : preview && mode === 'markdown' ? (
                <div className="min-h-[200px] overflow-auto rounded-md border border-line bg-white p-4">
                  <Markdown source={text} />
                </div>
              ) : (
                <textarea
                  id={id}
                  className={`${inputClass} ${mode === 'markdown' ? 'min-h-[360px] font-mono text-[13px]' : 'min-h-[96px]'}`}
                  value={text}
                  onChange={(e) => update(e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </FieldShell>
  );
}
