// Design Ref: §3.3 — ReadingProgress Repository 인터페이스
// Plan SC: FR-08 — 1독 진행률 추적
import type { ReadingProgress } from '../entities/ReadingProgress'

export interface IReadingProgressRepository {
  getProgress(userId: string): Promise<ReadingProgress[]>
  markChapterRead(userId: string, bookId: number, chapter: number): Promise<ReadingProgress>
  isChapterRead(userId: string, bookId: number, chapter: number): Promise<boolean>
}
