import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-page flex-col items-start justify-center gap-4 px-6">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="text-4xl font-semibold">Halaman tidak ditemukan · Page not found</h1>
      <Link href="/" className="inline-flex min-h-11 items-center font-semibold text-accent">
        ← Beranda · Home
      </Link>
    </main>
  );
}
