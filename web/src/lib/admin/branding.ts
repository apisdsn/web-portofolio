'use client';

import { useEffect, useState } from 'react';
import { api } from './client';

/** Logo text for admin screens, loaded from the public branding endpoint (works before login too). */
export function useLogoText(): string {
  const [logo, setLogo] = useState('');
  useEffect(() => {
    api<{ logoText: string }>('/public/branding')
      .then((branding) => setLogo(branding.logoText))
      .catch(() => setLogo(''));
  }, []);
  return logo;
}
