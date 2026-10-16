'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/admin/client';
import type { FieldDef, Item } from '@/lib/admin/resources';
import { FieldInput } from './FieldInput';
import { Button, Notice } from './ui';

interface Props {
  fields: FieldDef[];
  initial: Item;
  onSave: (item: Item) => Promise<void>;
  onCancel?: () => void;
  saveLabel?: string;
}

export function EntityForm({ fields, initial, onSave, onCancel, saveLabel = 'Simpan perubahan' }: Props) {
  const [draft, setDraft] = useState<Item>(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      await onSave(draft);
      setMessage({ kind: 'success', text: 'Tersimpan. Website publik akan diperbarui dalam beberapa detik.' });
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.fieldErrors);
        setMessage({ kind: 'error', text: e.message });
      } else {
        setMessage({ kind: 'error', text: 'Gagal menyimpan. Periksa koneksi lalu coba lagi.' });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      {fields.map((field) => (
        <FieldInput
          key={field.name}
          field={field}
          value={draft[field.name]}
          error={errors[field.name]}
          onChange={(value) => setDraft((prev) => ({ ...prev, [field.name]: value }))}
        />
      ))}

      {message ? <Notice kind={message.kind}>{message.text}</Notice> : null}

      <div className="sticky bottom-0 -mx-6 flex gap-2 border-t border-line bg-ground/95 px-6 py-4 backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? 'Menyimpan…' : saveLabel}
        </Button>
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Tutup
          </Button>
        ) : null}
      </div>
    </form>
  );
}
