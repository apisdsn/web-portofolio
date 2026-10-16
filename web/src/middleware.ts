import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'portfolio_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const preferred = request.headers.get('accept-language')?.toLowerCase() ?? '';
    const lang = preferred.startsWith('en') ? 'en' : 'id';
    return NextResponse.redirect(new URL(`/${lang}`, request.url));
  }

  if (pathname.startsWith('/admin')) {
    // Real authorization happens in the API; this only avoids flashing the dashboard.
    if (pathname !== '/admin/login' && !request.cookies.has(SESSION_COOKIE)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return withLang(request, 'id');
  }

  const lang = pathname.split('/')[1];
  return withLang(request, lang === 'en' ? 'en' : 'id');
}

/** Passes the page language to the root layout so <html lang> is correct. */
function withLang(request: NextRequest, lang: string) {
  const headers = new Headers(request.headers);
  headers.set('x-site-lang', lang);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api|internal|_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
