'use client';

import { Fragment, useEffect, useState } from 'react';
import { Button, Notice } from '@/components/admin/ui';
import { api } from '@/lib/admin/client';

interface AuditLog {
  id: number;
  actor: string;
  entityType: string;
  entityId: string;
  action: string;
  diff: { before?: unknown; after?: unknown };
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  totalPages: number;
  totalElements: number;
}

const formatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export default function AuditPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<AuditLog> | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<PageResponse<AuditLog>>(`/admin/audit-logs?page=${page}&size=20`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat'));
  }, [page]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Riwayat perubahan</h1>
        <p className="mt-1 text-sm text-muted">Setiap perubahan dari dashboard dicatat beserta isi sebelum dan sesudahnya.</p>
      </div>
      {error ? <Notice kind="error">{error}</Notice> : null}
      {data ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-line bg-white">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="px-4 py-3 font-semibold">Waktu</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Aksi</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Data</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Oleh</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Detail</span></th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((log) => (
                  <Fragment key={log.id}>
                    <tr className="border-b border-line">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{formatter.format(new Date(log.createdAt))}</td>
                      <td className="px-4 py-3 font-semibold">{log.action}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {log.entityType} #{log.entityId}
                      </td>
                      <td className="px-4 py-3 text-muted">{log.actor}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" onClick={() => setOpen(open === log.id ? null : log.id)} aria-expanded={open === log.id}>
                          {open === log.id ? 'Tutup' : 'Detail'}
                        </Button>
                      </td>
                    </tr>
                    {open === log.id ? (
                      <tr className="border-b border-line bg-ground">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            {(['before', 'after'] as const).map((side) => (
                              <div key={side}>
                                <p className="mb-1 text-xs font-semibold text-muted">{side === 'before' ? 'Sebelum' : 'Sesudah'}</p>
                                <pre className="max-h-80 overflow-auto rounded bg-ink p-3 font-mono text-xs text-codefg">
                                  {JSON.stringify(log.diff?.[side] ?? null, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              ← Sebelumnya
            </Button>
            <span className="text-sm text-muted">
              Halaman {data.page + 1} dari {Math.max(data.totalPages, 1)}
            </span>
            <Button variant="secondary" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
              Berikutnya →
            </Button>
          </div>
        </>
      ) : !error ? (
        <p className="text-sm text-muted">Memuat…</p>
      ) : null}
    </div>
  );
}
