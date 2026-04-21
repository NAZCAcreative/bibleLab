// Design Ref: §3.3 — Bible Repository 인터페이스 (Domain 레이어 순수 TS)
import type { Verse, VerseWithBook } from '../entities/Verse'
import type { Language } from '../value-objects/Language'

export interface IBibleRepository {
  getChapter(bookId: number, chapter: number): Promise<VerseWithBook[]>
  getVerse(bookId: number, chapter: number, verse: number): Promise<VerseWithBook | null>
  searchVerses(query: string, lang: Language): Promise<VerseWithBook[]>
}
