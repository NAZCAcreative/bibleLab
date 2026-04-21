// Design Ref: §9.1 — ReadingProgress Repository Prisma 구현체
// Plan SC: FR-08 — 1독 진행률 추적
import { prisma } from '../client'
import type { IReadingProgressRepository } from '@/domain/repositories/IReadingProgressRepository'
import type { ReadingProgress } from '@/domain/entities/ReadingProgress'

export class PrismaReadingProgressRepository implements IReadingProgressRepository {
  async getProgress(userId: string): Promise<ReadingProgress[]> {
    return prisma.readingProgress.findMany({
      where: { userId },
      orderBy: [{ bookId: 'asc' }, { chapter: 'asc' }],
    }) as Promise<ReadingProgress[]>
  }

  async markChapterRead(userId: string, bookId: number, chapter: number): Promise<ReadingProgress> {
    return prisma.readingProgress.upsert({
      where: { userId_bookId_chapter: { userId, bookId, chapter } },
      update: { readAt: new Date() },
      create: { userId, bookId, chapter },
    }) as Promise<ReadingProgress>
  }

  async isChapterRead(userId: string, bookId: number, chapter: number): Promise<boolean> {
    const record = await prisma.readingProgress.findUnique({
      where: { userId_bookId_chapter: { userId, bookId, chapter } },
    })
    return record !== null
  }
}
