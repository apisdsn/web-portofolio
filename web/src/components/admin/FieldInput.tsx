'use client';

import { useId } from 'react';
import type { FieldDef } from '@/lib/admin/resources';
import type { Localized, Metric } from '@/lib/types';
import { ImageCropUpload } from './ImageCropUpload';
import { LocalizedField } from './LocalizedField';
import { MetricsField } from './MetricsField';
import { PdfUpload } from './PdfUpload';
import { FieldShell, inputClass } from './ui';

interface Props {
  field: FieldDef;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}

/** "2025-07-01" <-> "2025-07" for <input type="month">. */
const toMonth = (value: unknown) => (typeof value === 'string' && value.length >= 7 ? value.slice(0, 7) : '');
const fromMonth = (value: string) => (value ? `${value}-01` : null);

export function FieldInput({ field, value, error, onChange }: Props) {
  const id = useId();
  const common = { label: field.label, help: field.help, error };

  switch (field.type) {
    case 'localized':
    case 'localizedTextarea':
    case 'localizedMarkdown':
      return (
        <LocalizedField
          {...common}
          mode={field.type === 'localized' ? 'line' : field.type === 'localizedTextarea' ? 'text' : 'markdown'}
          value={value as Localized | undefined}
          onChange={onChange}
        />
      );
    case 'metrics':
      return <MetricsField label={field.label} error={error} value={value as Metric[] | undefined} onChange={onChange} />;
    case 'image':
      return <ImageCropUpload label={field.label} error={error} value={value as string | null} onChange={onChange} />;
    case 'pdf':
      return <PdfUpload label={field.label} error={error} value={value as string | null} onChange={onChange} />;
    case 'boolean':
      return (
        <label className="flex min-h-10 items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            className="h-5 w-5 accent-ink"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.label}
        </label>
      );
    case 'tags':
      return (
        <FieldShell {...common} htmlFor={id}>
          <input
            id={id}
            className={inputClass}
            defaultValue={Array.isArray(value) ? value.join(', ') : ''}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </FieldShell>
      );
    case 'month':
      return (
        <FieldShell {...common} htmlFor={id}>
          <input
            id={id}
            type="month"
            className={inputClass}
            value={toMonth(value)}
            onChange={(e) => onChange(fromMonth(e.target.value))}
          />
        </FieldShell>
      );
    case 'number':
      return (
        <FieldShell {...common} htmlFor={id}>
          <input
            id={id}
            type="number"
            className={inputClass}
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          />
        </FieldShell>
      );
    case 'color':
      return (
        <FieldShell {...common} htmlFor={id}>
          <div className="flex items-center gap-3">
            <input
              id={id}
              type="color"
              className="h-10 w-14 cursor-pointer rounded border border-line bg-white"
              value={typeof value === 'string' ? value : '#1B6E47'}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
            />
            <span className="font-mono text-sm">{String(value ?? '')}</span>
          </div>
        </FieldShell>
      );
    default:
      return (
        <FieldShell {...common} htmlFor={id}>
          <input
            id={id}
            type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
            className={inputClass}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </FieldShell>
      );
  }
}
