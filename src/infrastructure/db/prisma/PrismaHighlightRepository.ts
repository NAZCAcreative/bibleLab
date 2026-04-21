// Design Ref: §9.1 — Highlight Repository Prisma 구현체
import { prisma } from '../client'
import type { IHighlightRepository } from '@/domain/repositories/IHighlightRepository'
import type { Highlight } from '@/domain/entities/Highlight'
import type { HighlightColor } from '@/domain/value-objects/HighlightColor'

export class PrismaHighlightRepository implements IHighlightRepository {
  async getByUser(userId: string): Promise<Highlight[]> {
    return prisma.highlight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<Highlight[]>
  }

  async getByVerse(userId: string, verseId: string): Promise<Highlight | null> {
    return prisma.highlight.findUnique({
      where: { userId_verseId: { userId, verseId } },
    }) as Promise<Highlight | null>
  }

  async upsert(data: { userId: string; verseId: string; color: HighlightColor }): Promise<Highlight> {
    return prisma.highlight.upsert({
      where: { userId_verseId: { userId: data.userId, verseId: data.verseId } },
      update: { color: data.color },
      create: { userId: data.userId, verseId: data.verseId, color: data.color },
    }) as Promise<Highlight>
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.highlight.deleteMany({ where: { id, userId } })
  }
}
