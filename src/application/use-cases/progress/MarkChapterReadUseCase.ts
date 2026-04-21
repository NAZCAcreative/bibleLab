// Design Ref: §9.1 Application — 장 읽음 처리 유스케이스
// Plan SC: FR-08 — 1독 진행률
import type { IReadingProgressRepository } from '@/domain/repositories/IReadingProgressRepository'
import type { ReadingProgress } from '@/domain/entities/ReadingProgress'
import { getBookById } from '@/domain/value-objects/BookName'

export interface MarkChapterReadInput {
  userId: string
  bookId: number
  chapter: number
}

export class MarkChapterReadUseCase {
  constructor(private readonly progressRepo: IReadingProgressRepository) {}

  async execute(input: MarkChapterReadInput): Promise<ReadingProgress> {
    const book = getBookById(input.bookId)
    if (!book) throw new Error(`Invalid bookId: ${input.bookId}`)
    if (input.chapter < 1 || input.chapter > book.totalChapters) {
      throw new Error(`Invalid chapter: ${input.chapter}`)
    }
    return this.progressRepo.markChapterRead(input.userId, input.bookId, input.chapter)
  }
}
