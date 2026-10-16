import type { Localized } from '../types';

export type FieldType =
  | 'text'
  | 'url'
  | 'email'
  | 'number'
  | 'boolean'
  | 'month'
  | 'color'
  | 'tags'
  | 'localized'
  | 'localizedTextarea'
  | 'localizedMarkdown'
  | 'metrics'
  | 'image'
  | 'pdf';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
}

export type Item = Record<string, unknown> & { id?: number; published?: boolean };

export interface ResourceDef {
  key: string;
  title: string;
  endpoint: string;
  fields: FieldDef[];
  summary: (item: Item) => string;
  empty: () => Item;
}

const l = (): Localized => ({ id: '', en: '' });
const loc = (item: Item, field: string): string => {
  const value = item[field] as Localized | undefined;
  return value?.id || value?.en || '';
};

const published: FieldDef = { name: 'published', label: 'Tampilkan di website', type: 'boolean' };

export const RESOURCES: ResourceDef[] = [
  {
    key: 'case-studies',
    title: 'Case study',
    endpoint: '/admin/case-studies',
    summary: (item) => loc(item, 'title') || String(item.slug ?? ''),
    empty: () => ({
      slug: '', title: l(), summary: l(), tags: [], role: l(), period: l(), organization: '', stack: '',
      problem: l(), approach: l(), result: l(), metrics: [], body: l(), featured: false, published: false,
    }),
    fields: [
      { name: 'title', label: 'Judul', type: 'localized' },
      { name: 'slug', label: 'Slug (URL)', type: 'text', help: 'Huruf kecil dan tanda hubung, mis. column-level-encryption' },
      { name: 'summary', label: 'Ringkasan (kartu di beranda)', type: 'localizedTextarea' },
      { name: 'tags', label: 'Tag', type: 'tags', help: 'Pisahkan dengan koma' },
      { name: 'role', label: 'Peran', type: 'localized' },
      { name: 'period', label: 'Periode', type: 'localized' },
      { name: 'organization', label: 'Perusahaan', type: 'text' },
      { name: 'stack', label: 'Stack', type: 'text' },
      { name: 'problem', label: 'TL;DR — Masalah', type: 'localizedTextarea' },
      { name: 'approach', label: 'TL;DR — Pendekatan', type: 'localizedTextarea' },
      { name: 'result', label: 'TL;DR — Hasil', type: 'localizedTextarea' },
      { name: 'metrics', label: 'Metrik', type: 'metrics' },
      { name: 'body', label: 'Isi (Markdown)', type: 'localizedMarkdown' },
      { name: 'featured', label: 'Jadikan case study utama di beranda', type: 'boolean' },
      published,
    ],
  },
  {
    key: 'experiences',
    title: 'Pengalaman',
    endpoint: '/admin/experiences',
    summary: (item) => `${loc(item, 'role')} — ${String(item.organization ?? '')}`,
    empty: () => ({
      startDate: '', endDate: null, current: false, role: l(), organization: '', description: l(), stack: [], published: true,
    }),
    fields: [
      { name: 'role', label: 'Jabatan', type: 'localized' },
      { name: 'organization', label: 'Perusahaan / penyelenggara', type: 'text' },
      { name: 'startDate', label: 'Mulai', type: 'month' },
      { name: 'endDate', label: 'Selesai', type: 'month', help: 'Kosongkan jika masih berjalan' },
      { name: 'current', label: 'Masih berjalan (tampil "sekarang")', type: 'boolean' },
      { name: 'description', label: 'Deskripsi', type: 'localizedTextarea' },
      { name: 'stack', label: 'Stack', type: 'tags', help: 'Pisahkan dengan koma' },
      published,
    ],
  },
  {
    key: 'projects',
    title: 'Proyek',
    endpoint: '/admin/projects',
    summary: (item) => String(item.name ?? ''),
    empty: () => ({ slug: '', name: '', tag: l(), description: l(), repoUrl: '', demoUrl: '', published: true }),
    fields: [
      { name: 'name', label: 'Nama', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'text', help: 'Huruf kecil dan tanda hubung' },
      { name: 'tag', label: 'Label kecil di atas nama', type: 'localized' },
      { name: 'description', label: 'Deskripsi', type: 'localizedTextarea' },
      { name: 'repoUrl', label: 'URL repo', type: 'url' },
      { name: 'demoUrl', label: 'URL demo', type: 'url' },
      published,
    ],
  },
  {
    key: 'skill-groups',
    title: 'Keahlian',
    endpoint: '/admin/skill-groups',
    summary: (item) => loc(item, 'label'),
    empty: () => ({ label: l(), items: l(), published: true }),
    fields: [
      { name: 'label', label: 'Kategori', type: 'localized' },
      { name: 'items', label: 'Daftar keahlian', type: 'localizedTextarea', help: 'Contoh: Java · TypeScript · Python' },
      published,
    ],
  },
  {
    key: 'education',
    title: 'Pendidikan',
    endpoint: '/admin/education',
    summary: (item) => `${loc(item, 'degree')} — ${String(item.institution ?? '')}`,
    empty: () => ({ degree: l(), institution: '', startYear: new Date().getFullYear(), endYear: null, gpa: '', thesis: l(), published: true }),
    fields: [
      { name: 'degree', label: 'Gelar / program', type: 'localized' },
      { name: 'institution', label: 'Institusi', type: 'text' },
      { name: 'startYear', label: 'Tahun mulai', type: 'number' },
      { name: 'endYear', label: 'Tahun lulus', type: 'number' },
      { name: 'gpa', label: 'IPK', type: 'text', help: 'Format 3.30/4.00' },
      { name: 'thesis', label: 'Skripsi / catatan', type: 'localizedTextarea' },
      published,
    ],
  },
  {
    key: 'certifications',
    title: 'Sertifikasi',
    endpoint: '/admin/certifications',
    summary: (item) => `${loc(item, 'name')} — ${String(item.issuer ?? '')}`,
    empty: () => ({ name: l(), issuer: '', year: new Date().getFullYear(), published: true }),
    fields: [
      { name: 'name', label: 'Nama sertifikasi', type: 'localized' },
      { name: 'issuer', label: 'Penerbit', type: 'text' },
      { name: 'year', label: 'Tahun', type: 'number' },
      published,
    ],
  },
];

export const PROFILE_FIELDS: FieldDef[] = [
  { name: 'photoMediaId', label: 'Foto profil', type: 'image' },
  { name: 'fullName', label: 'Nama lengkap', type: 'text' },
  { name: 'statusText', label: 'Teks gelembung status', type: 'localized', help: 'Singkat, maks. ±15 karakter agar muat di mobile' },
  { name: 'headline', label: 'Headline', type: 'localizedTextarea' },
  { name: 'subHeadline', label: 'Sub-headline', type: 'localizedTextarea' },
  { name: 'location', label: 'Lokasi', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'linkedinUrl', label: 'URL LinkedIn', type: 'url' },
  { name: 'githubUrl', label: 'URL GitHub', type: 'url' },
  { name: 'contactText', label: 'Teks bagian kontak', type: 'localizedTextarea' },
  { name: 'cvMediaId', label: 'CV (PDF)', type: 'pdf' },
  { name: 'accentColor', label: 'Warna aksen', type: 'color' },
  { name: 'seoTitle', label: 'Judul SEO', type: 'localized' },
  { name: 'seoDescription', label: 'Deskripsi SEO', type: 'localizedTextarea' },
];

export function findResource(key: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.key === key);
}
