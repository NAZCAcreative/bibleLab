// Design Ref: §3.2 — 언어 전환 (EN / KO / bilingual) Value Object
export type Language = 'en' | 'ko' | 'bilingual'

export const LANGUAGES: Record<Language, string> = {
  en: 'English (KJV)',
  ko: '한국어',
  bilingual: '한영 병행',
}

export function isValidLanguage(value: string): value is Language {
  return ['en', 'ko', 'bilingual'].includes(value)
}
