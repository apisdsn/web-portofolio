'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/admin/client';
import { RESOURCES } from '@/lib/admin/resources';
import { Button, Notice } from '@/components/admin/ui';

export default function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  async function publish() {
    setBusy(true);
    setResult(null);
    try {
      const res = await api<{ revalidated: boolean }>('/admin/publish', { method: 'POST' });
      setResult(
        res.revalidated
          ? { kind: 'success', text: 'Website publik sudah diperbarui.' }
          : { kind: 'error', text: 'API tidak bisa menghubungi frontend. Cek REVALIDATE_URL dan REVALIDATE_SECRET.' },
      );
    } catch (e) {
      setResult({ kind: 'error', text: e instanceof Error ? e.message : 'Gagal' });
    } finally {
      setBusy(false);
    }
  }

  const cards = [
    { href: '/admin/profile', title: 'Profil & pengaturan', body: 'Foto, headline, status, kontak, CV, warna aksen, SEO.' },
    ...RESOURCES.map((r) => ({ href: `/admin/${r.key}`, title: r.title, body: 'Tambah, edit, hapus, dan atur urutan.' })),
    { href: '/admin/audit', title: 'Riwayat perubahan', body: 'Siapa mengubah apa dan kapan.' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Semua perubahan langsung tersimpan dan website publik diperbarui otomatis. Tombol di bawah untuk memaksa
          pembaruan jika perlu.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void publish()} disabled={busy}>
            {busy ? 'Memperbarui…' : 'Perbarui website publik sekarang'}
          </Button>
          <a href="/api/docs" target="_blank" rel="noreferrer" className="text-sm font-semibold underline">
            Dokumentasi API (Swagger) ↗
          </a>
        </div>
        {result ? <Notice kind={result.kind}>{result.text}</Notice> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="flex flex-col gap-1 rounded-lg border border-line bg-white p-5 hover:border-ink">
            <span className="font-semibold">{card.title}</span>
            <span className="text-sm text-muted">{card.body}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
