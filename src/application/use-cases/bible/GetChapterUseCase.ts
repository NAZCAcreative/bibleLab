// Design Ref: §9.1 Application — 장 조회 유스케이스
import type { IBibleRepository } from '@/domain/repositories/IBibleRepository'
import type { VerseWithBook } from '@/domain/entities/Verse'
import { getBookById } from '@/domain/value-objects/BookName'

export interface GetChapterInput {
  bookId: number
  chapter: number
}

export interface GetChapterOutput {
  book: { id: number; nameEn: string; nameKo: string; nameAbbr: string; totalChapters: number }
  chapter: number
  verses: VerseWithBook[]
}

export class GetChapterUseCase {
  constructor(private readonly bibleRepo: IBibleRepository) {}

  async execute(input: GetChapterInput): Promise<GetChapterOutput> {
    const bookMeta = getBookById(input.bookId)
    if (!bookMeta) throw new Error(`Invalid bookId: ${input.bookId}`)
    if (input.chapter < 1 || input.chapter > bookMeta.totalChapters) {
      throw new Error(`Invalid chapter ${input.chapter} for book ${input.bookId}`)
    }

    const verses = await this.bibleRepo.getChapter(input.bookId, input.chapter)

    return {
      book: {
        id: bookMeta.id,
        nameEn: bookMeta.nameEn,
        nameKo: bookMeta.nameKo,
        nameAbbr: bookMeta.nameAbbr,
        totalChapters: bookMeta.totalChapters,
      },
      chapter: input.chapter,
      verses,
    }
  }
}
