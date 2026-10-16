'use client';

import type { Metric } from '@/lib/types';
import { Button, FieldShell, inputClass } from './ui';

interface Props {
  label: string;
  error?: string;
  value: Metric[] | undefined;
  onChange: (value: Metric[]) => void;
}

export function MetricsField({ label, error, value, onChange }: Props) {
  const metrics = value ?? [];
  const update = (index: number, next: Metric) => onChange(metrics.map((m, i) => (i === index ? next : m)));

  return (
    <FieldShell label={label} error={error} help="Angka utama yang tampil besar, mis. 120 ms atau 3x.">
      <div className="flex flex-col gap-3">
        {metrics.map((metric, index) => (
          <fieldset key={index} className="grid gap-2 rounded-md border border-line p-3 md:grid-cols-[140px_1fr_1fr_auto]">
            <legend className="sr-only">Metrik {index + 1}</legend>
            <input
              aria-label="Nilai"
              placeholder="Nilai"
              className={`${inputClass} font-mono`}
              value={metric.value}
              onChange={(e) => update(index, { ...metric, value: e.target.value })}
            />
            <input
              aria-label="Label (Indonesia)"
              placeholder="Label (ID)"
              className={inputClass}
              value={metric.label?.id ?? ''}
              onChange={(e) => update(index, { ...metric, label: { ...metric.label, id: e.target.value } })}
            />
            <input
              aria-label="Label (English)"
              placeholder="Label (EN)"
              className={inputClass}
              value={metric.label?.en ?? ''}
              onChange={(e) => update(index, { ...metric, label: { ...metric.label, en: e.target.value } })}
            />
            <Button variant="danger" onClick={() => onChange(metrics.filter((_, i) => i !== index))}>
              Hapus
            </Button>
          </fieldset>
        ))}
        <Button
          variant="secondary"
          className="self-start"
          onClick={() => onChange([...metrics, { value: '', label: { id: '', en: '' } }])}
        >
          + Tambah metrik
        </Button>
      </div>
    </FieldShell>
  );
}
