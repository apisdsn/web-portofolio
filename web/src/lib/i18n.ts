import type { Experience, Lang } from './types';

/** Fixed interface text. Content itself comes from the API and is edited in the admin. */
export const ui = {
  id: {
    nav: { caseStudy: 'Case study', experience: 'Pengalaman', projects: 'Proyek', skills: 'Keahlian', contact: 'Kontak' },
    languageGroup: 'Bahasa',
    readCaseStudy: 'Baca case study',
    contactMe: 'Hubungi saya',
    sections: {
      caseStudies: 'Case study pilihan',
      experience: 'Pengalaman',
      projects: 'Proyek',
      skills: 'Keahlian',
      education: 'Pendidikan & sertifikasi',
      certifications: 'Sertifikasi',
    },
    readMore: 'Baca selengkapnya →',
    repo: 'Repo ↗',
    demo: 'Demo ↗',
    present: 'sekarang',
    gpa: 'IPK',
    sendEmail: 'Kirim email',
    downloadCv: 'Unduh CV (PDF)',
    letsTalk: 'Mari ngobrol',
    backToCaseStudies: '← Semua case study',
    role: 'Peran',
    period: 'Periode',
    company: 'Perusahaan',
    problem: 'Masalah',
    approach: 'Pendekatan',
    result: 'Hasil',
    photoAlt: (name: string) => `Foto ${name} sedang bekerja`,
    errorTitle: 'Konten sedang tidak bisa dimuat',
    errorBody: 'Coba muat ulang halaman ini dalam beberapa saat.',
    retry: 'Muat ulang',
  },
  en: {
    nav: { caseStudy: 'Case study', experience: 'Experience', projects: 'Projects', skills: 'Skills', contact: 'Contact' },
    languageGroup: 'Language',
    readCaseStudy: 'Read the case study',
    contactMe: 'Get in touch',
    sections: {
      caseStudies: 'Featured case studies',
      experience: 'Experience',
      projects: 'Projects',
      skills: 'Skills',
      education: 'Education & certifications',
      certifications: 'Certifications',
    },
    readMore: 'Read more →',
    repo: 'Repo ↗',
    demo: 'Demo ↗',
    present: 'present',
    gpa: 'GPA',
    sendEmail: 'Send an email',
    downloadCv: 'Download CV (PDF)',
    letsTalk: "Let's talk",
    backToCaseStudies: '← All case studies',
    role: 'Role',
    period: 'Period',
    company: 'Company',
    problem: 'Problem',
    approach: 'Approach',
    result: 'Result',
    photoAlt: (name: string) => `Photo of ${name} at work`,
    errorTitle: 'Content could not be loaded',
    errorBody: 'Please reload this page in a moment.',
    retry: 'Reload',
  },
} as const;

export type UiText = (typeof ui)[Lang];

function formatMonth(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(new Date(`${date}T00:00:00Z`))
    .replace('.', '');
}

/** "Jul 2025 – Apr 2026", "Mei 2025", "Jul 2026 – sekarang". */
export function formatPeriod(exp: Pick<Experience, 'startDate' | 'endDate' | 'current'>, lang: Lang): string {
  const start = formatMonth(exp.startDate, lang);
  if (exp.current) return `${start} – ${ui[lang].present}`;
  if (!exp.endDate) return start;
  const end = formatMonth(exp.endDate, lang);
  return start === end ? start : `${start} – ${end}`;
}
