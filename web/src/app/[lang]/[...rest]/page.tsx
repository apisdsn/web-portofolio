import { notFound } from 'next/navigation';

// Any address that matches no page ends here (the middleware also sends unknown
// language prefixes here), so the styled 404 inside the site layout is shown.
export default function CatchAll() {
  notFound();
}
