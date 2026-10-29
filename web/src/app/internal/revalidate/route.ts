import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { SITE_TAG } from '@/lib/api';

export const dynamic = 'force-dynamic';

function secretMatches(provided: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Called by the API after every admin change so the public pages show it immediately. */
export async function POST(request: Request) {
  if (!secretMatches(request.headers.get('x-revalidate-secret'))) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  revalidateTag(SITE_TAG);
  // Also drop the cached HTML of every public page (and their preview images)
  revalidatePath('/[lang]', 'layout');
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
