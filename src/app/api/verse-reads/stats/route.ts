import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/verse-reads/stats — 전체 읽은 구절 수 + 전체 구절 수 대비 퍼센트
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const [readCount, totalCount] = await Promise.all([
    prisma.verseRead.count({ where: { userId: session.user.id } }),
    prisma.verse.count(),
  ])

  const percentage = totalCount > 0 ? Math.round((readCount / totalCount) * 10000) / 100 : 0

  return ok({ readCount, totalCount, percentage })
}
