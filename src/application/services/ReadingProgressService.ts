// Design Ref: §9.1 Application — 1독 진행률 계산 서비스
// Plan SC: FR-08 — 퍼센테이지 계산 로직은 Domain 데이터에 의존하므로 Application 레이어에 위치
import type { ReadingProgress, ProgressSummary, BookProgress } from '@/domain/entities/ReadingProgress'
import { BOOKS, TOTAL_CHAPTERS } from '@/domain/value-objects/BookName'

export class ReadingProgressService {
  /**
   * 읽은 장 목록 → 진행률 요약 계산
   * Plan SC: FR-08 — 전체 퍼센테이지 + 책별 진행 현황
   */
  calculateSummary(progressRecords: ReadingProgress[]): ProgressSummary {
    // 책별로 읽은 장 수 집계
    const readByBook = new Map<number, Set<number>>()
    for (const record of progressRecords) {
      if (!readByBook.has(record.bookId)) {
        readByBook.set(record.bookId, new Set())
      }
      readByBook.get(record.bookId)!.add(record.chapter)
    }

    const byBook: BookProgress[] = BOOKS.map((book) => {
      const readChapters = readByBook.get(book.id)?.size ?? 0
      return {
        bookId: book.id,
        nameKo: book.nameKo,
        nameEn: book.nameEn,
        totalChapters: book.totalChapters,
        readChapters,
        completed: readChapters >= book.totalChapters,
      }
    })

    const totalRead = byBook.reduce((sum, b) => sum + b.readChapters, 0)
    const percentage = Math.round((totalRead / TOTAL_CHAPTERS) * 1000) / 10  // 소수점 1자리

    // CalendarView용: 읽은 날짜 목록 (중복 제거, YYYY-MM-DD)
    const readDatesSet = new Set(
      progressRecords.map((r) => new Date(r.readAt).toISOString().slice(0, 10))
    )
    const readDates = Array.from(readDatesSet)

    return {
      percentage,
      totalChapters: TOTAL_CHAPTERS,
      readChapters: totalRead,
      byBook,
      readDates,
    }
  }
}
