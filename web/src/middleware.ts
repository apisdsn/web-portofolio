import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'portfolio_token';
const LANGS = new Set(['id', 'en']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const preferred = request.headers.get('accept-language')?.toLowerCase() ?? '';
    const lang = preferred.startsWith('en') ? 'en' : 'id';
    return NextResponse.redirect(new URL(`/${lang}`, request.url));
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Real authorization happens in the API; this only avoids flashing the dashboard.
    if (pathname !== '/admin/login' && !request.cookies.has(SESSION_COOKIE)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // /foo or /foo/bar: no such language. Serve the site's own 404 page (inside the
  // [lang] layout) without changing the address in the browser.
  const first = pathname.split('/')[1];
  if (!LANGS.has(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/id${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip the API, internal routes, Next.js assets and any file with an extension
  // (favicon.ico, robots.txt, sitemap.xml, icon.svg, ...).
  matcher: ['/((?!api/|internal/|_next/|.*\\.[a-z0-9]+$).*)'],
};
