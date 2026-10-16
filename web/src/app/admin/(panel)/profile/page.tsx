'use client';

import { useEffect, useState } from 'react';
import { EntityForm } from '@/components/admin/EntityForm';
import { Notice } from '@/components/admin/ui';
import { api } from '@/lib/admin/client';
import { PROFILE_FIELDS, type Item } from '@/lib/admin/resources';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Item>('/admin/profile')
      .then(setProfile)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat profil'));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Profil & pengaturan</h1>
        <p className="mt-1 text-sm text-muted">Isi dalam dua bahasa. Kolom yang belum diterjemahkan ditandai.</p>
      </div>
      {error ? <Notice kind="error">{error}</Notice> : null}
      {profile ? (
        <EntityForm
          fields={PROFILE_FIELDS}
          initial={profile}
          onSave={async (draft) => {
            const saved = await api<Item>('/admin/profile', { method: 'PUT', body: draft });
            setProfile(saved);
          }}
        />
      ) : !error ? (
        <p className="text-sm text-muted">Memuat…</p>
      ) : null}
    </div>
  );
}
