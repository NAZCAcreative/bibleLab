// Design Ref: §3.1 — Verse 엔티티 (KJV + 한국어 이중 언어)
export interface Verse {
  id: string
  bookId: number       // 1-66
  chapter: number
  verse: number
  textEn: string       // KJV 원문 (공개 도메인)
  textKo: string       // 한국어 번역 (AI 번역 or 라이선스 취득본)
}

export interface VerseWithBook extends Verse {
  book: {
    id: number
    nameEn: string
    nameKo: string
    nameAbbr: string
  }
}
