import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: '#F3F4F1',
        surface: '#FFFFFF',
        ink: '#15171A',
        muted: '#565B62',
        line: '#DADDD8',
        chip: '#E8EBE6',
        codefg: '#E6E8E3',
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        page: '1120px',
      },
    },
  },
  plugins: [typography],
};

export default config;
