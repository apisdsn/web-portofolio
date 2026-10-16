'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError } from '@/lib/admin/client';
import { Button, FieldShell, inputClass, Notice } from '@/components/admin/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/auth/login', { method: 'POST', body: { email, password } });
      router.replace('/admin');
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 429
          ? 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.'
          : 'Email atau password salah.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ground px-6">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-line bg-white p-8">
        <div>
          <p className="font-mono text-sm font-semibold">~/apisdsn admin</p>
          <h1 className="mt-1 text-2xl font-semibold">Masuk</h1>
        </div>
        <FieldShell label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FieldShell>
        <FieldShell label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FieldShell>
        {error ? <Notice kind="error">{error}</Notice> : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Memproses…' : 'Masuk'}
        </Button>
      </form>
    </main>
  );
}
