// Design Ref: §9.1 — Memo Repository Prisma 구현체
import { prisma } from '../client'
import type { IMemoRepository } from '@/domain/repositories/IMemoRepository'
import type { Memo } from '@/domain/entities/Memo'

export class PrismaMemoRepository implements IMemoRepository {
  async getByVerse(userId: string, verseId: string): Promise<Memo | null> {
    return prisma.memo.findUnique({
      where: { userId_verseId: { userId, verseId } },
    }) as Promise<Memo | null>
  }

  async upsert(data: { userId: string; verseId: string; content: string; color?: string }): Promise<Memo> {
    const color = data.color ?? 'yellow'
    return prisma.memo.upsert({
      where: { userId_verseId: { userId: data.userId, verseId: data.verseId } },
      update: { content: data.content, color },
      create: { userId: data.userId, verseId: data.verseId, content: data.content, color },
    }) as Promise<Memo>
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.memo.deleteMany({ where: { id, userId } })
  }
}
