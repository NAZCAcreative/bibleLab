// Design Ref: §9.1 — QTNote Repository Prisma 구현체
import { prisma } from '../client'
import type { IQTNoteRepository } from '@/domain/repositories/IQTNoteRepository'
import type { QTNote } from '@/domain/entities/QTNote'

export class PrismaQTNoteRepository implements IQTNoteRepository {
  async getByDate(userId: string, date: Date): Promise<QTNote | null> {
    // 날짜 비교: 시간 무시하고 날짜만 비교
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return prisma.qTNote.findFirst({
      where: { userId, date: { gte: start, lte: end } },
    }) as Promise<QTNote | null>
  }

  async getAll(userId: string): Promise<QTNote[]> {
    return prisma.qTNote.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    }) as Promise<QTNote[]>
  }

  async upsert(data: {
    userId: string
    date: Date
    verseRef?: string
    content: string
  }): Promise<QTNote> {
    const dateOnly = new Date(data.date)
    dateOnly.setHours(0, 0, 0, 0)

    return prisma.qTNote.upsert({
      where: { userId_date: { userId: data.userId, date: dateOnly } },
      update: { content: data.content, verseRef: data.verseRef ?? null },
      create: {
        userId: data.userId,
        date: dateOnly,
        content: data.content,
        verseRef: data.verseRef ?? null,
      },
    }) as Promise<QTNote>
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.qTNote.deleteMany({ where: { id, userId } })
  }
}
