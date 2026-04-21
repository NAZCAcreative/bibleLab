// Design Ref: §9.1 Application — 성경 검색 유스케이스
// Plan SC: FR-03 — 키워드 검색
import type { IBibleRepository } from '@/domain/repositories/IBibleRepository'
import type { VerseWithBook } from '@/domain/entities/Verse'
import { isValidLanguage, type Language } from '@/domain/value-objects/Language'

export interface SearchVersesInput {
  query: string
  lang?: string
}

export class SearchVersesUseCase {
  constructor(private readonly bibleRepo: IBibleRepository) {}

  async execute(input: SearchVersesInput): Promise<VerseWithBook[]> {
    const query = input.query.trim()
    if (!query || query.length < 2) {
      throw new Error('검색어는 2자 이상 입력해주세요.')
    }

    const lang: Language = isValidLanguage(input.lang ?? '') ? (input.lang as Language) : 'ko'
    return this.bibleRepo.searchVerses(query, lang)
  }
}
