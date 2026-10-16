'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/admin/client';
import { useLogoText } from '@/lib/admin/branding';
import { RESOURCES } from '@/lib/admin/resources';
import { Button } from './ui';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/profile', label: 'Profil & pengaturan' },
  ...RESOURCES.map((r) => ({ href: `/admin/${r.key}`, label: r.title })),
  { href: '/admin/audit', label: 'Riwayat perubahan' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const logo = useLogoText();

  useEffect(() => {
    api<{ email: string }>('/auth/me')
      .then((me) => setEmail(me.email))
      .catch(() => {
        // api() already redirects to the login page on 401
      });
  }, []);

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
    }
  }

  if (!email) {
    return <p className="p-8 text-sm text-muted">Memeriksa sesi…</p>;
  }

  return (
    <div className="flex min-h-screen flex-wrap bg-ground">
      <aside className="flex w-full flex-col gap-6 border-b border-line bg-white p-5 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[15px] font-semibold">{logo ? `${logo} admin` : 'Admin'}</span>
          <span className="truncate text-xs text-muted">{email}</span>
        </div>
        <nav aria-label="Admin" className="flex flex-wrap gap-1 md:flex-col">
          {NAV.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${active ? 'bg-ink text-white' : 'hover:bg-chip'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-wrap gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-md border border-line px-3 text-sm font-semibold hover:border-ink">
            Lihat situs ↗
          </a>
          <Button variant="ghost" onClick={() => void logout()}>
            Keluar
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-[999_1_560px] p-6 md:p-10">
        <div className="mx-auto max-w-[960px]">{children}</div>
      </main>
    </div>
  );
}
