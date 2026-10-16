export const LANGS = ['id', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** Bilingual text as stored by the API: {"id": "...", "en": "..."} */
export type Localized = Partial<Record<Lang, string>>;

export interface Profile {
  id: number;
  fullName: string;
  /** Text logo, e.g. "~/apisdsn" */
  logoText: string;
  headline: Localized;
  subHeadline: Localized;
  statusText: Localized;
  location: string;
  email: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  contactText: Localized;
  photoMediaId: string | null;
  cvMediaId: string | null;
  accentColor: string;
  defaultLang: Lang;
  seoTitle: Localized;
  seoDescription: Localized;
  updatedAt: string;
}

interface Ordered {
  id: number;
  sortOrder: number;
  published: boolean;
  updatedAt: string;
}

export interface Experience extends Ordered {
  startDate: string;
  endDate: string | null;
  current: boolean;
  role: Localized;
  organization: string;
  description: Localized;
  stack: string[];
}

export interface Project extends Ordered {
  slug: string;
  name: string;
  tag: Localized;
  description: Localized;
  repoUrl: string | null;
  demoUrl: string | null;
}

export interface Metric {
  value: string;
  label: Localized;
}

export interface CaseStudySummary {
  id: number;
  slug: string;
  title: Localized;
  summary: Localized;
  tags: string[];
  stack: string;
  metrics: Metric[];
  featured: boolean;
}

export interface CaseStudy extends Ordered {
  slug: string;
  title: Localized;
  summary: Localized;
  tags: string[];
  role: Localized;
  period: Localized;
  organization: string;
  stack: string;
  problem: Localized;
  approach: Localized;
  result: Localized;
  metrics: Metric[];
  body: Localized;
  featured: boolean;
}

export interface SkillGroup extends Ordered {
  label: Localized;
  items: Localized;
}

export interface Education extends Ordered {
  degree: Localized;
  institution: string;
  startYear: number;
  endYear: number | null;
  gpa: string | null;
  thesis: Localized;
}

export interface Certification extends Ordered {
  name: Localized;
  issuer: string;
  year: number;
}

export interface SiteData {
  profile: Profile;
  experiences: Experience[];
  projects: Project[];
  caseStudies: CaseStudySummary[];
  skillGroups: SkillGroup[];
  education: Education[];
  certifications: Certification[];
}

export interface Media {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

/** Picks the requested language, falling back to the other one so nothing renders empty. */
export function tr(text: Localized | null | undefined, lang: Lang): string {
  if (!text) return '';
  return text[lang] || text.id || text.en || '';
}

export function mediaUrl(id: string | null | undefined): string | null {
  return id ? `/api/media/${id}` : null;
}
