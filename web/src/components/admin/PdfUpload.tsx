'use client';

import { useState } from 'react';
import { api } from '@/lib/admin/client';
import { mediaUrl, type Media } from '@/lib/types';
import { Button, FieldShell } from './ui';

interface Props {
  label: string;
  error?: string;
  value: string | null | undefined;
  onChange: (mediaId: string | null) => void;
}

export function PdfUpload({ label, error, value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const current = mediaUrl(value);

  async function upload(file: File) {
    setBusy(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append('file', file, file.name);
      const media = await api<Media>('/admin/media', { method: 'POST', formData: form });
      onChange(media.id);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <FieldShell label={label} error={error ?? uploadError ?? undefined} help="PDF, maks. 5 MB.">
      <div className="flex flex-wrap items-center gap-3">
        {current ? (
          <a href={current} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent underline">
            Lihat CV saat ini
          </a>
        ) : (
          <span className="text-sm text-muted">Belum ada CV</span>
        )}
        <label className="inline-flex min-h-10 cursor-pointer items-center rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-ink">
          {busy ? 'Mengunggah…' : 'Unggah PDF'}
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = '';
            }}
          />
        </label>
        {value ? (
          <Button variant="ghost" onClick={() => onChange(null)}>
            Hapus
          </Button>
        ) : null}
      </div>
    </FieldShell>
  );
}
