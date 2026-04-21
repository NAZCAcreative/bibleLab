import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'
import { getTotalLevel, getTitle } from '@/lib/levelSystem'

// GET /api/verse-reads/ranking — 전체 통독 순위
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const counts = await prisma.verseRead.groupBy({
    by: ['userId'],
    _count: { verseId: true },
    orderBy: { _count: { verseId: 'desc' } },
    take: 50,
  })

  const userIds = counts.map((c) => c.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, church: true, prestige: true },
  })

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const ranking = counts
    .map((c) => {
      const u = userMap[c.userId]
      const prestige = u?.prestige ?? 0
      const verseCount = c._count.verseId
      const totalLevel = getTotalLevel(verseCount, prestige)
      return {
        userId: c.userId,
        name: u?.name ?? '익명',
        church: u?.church ?? null,
        verseCount,
        prestige,
        totalLevel,
        title: getTitle(totalLevel),
        isMe: c.userId === session.user.id,
      }
    })
    .sort((a, b) => b.totalLevel - a.totalLevel || b.verseCount - a.verseCount)
    .map((r, i) => ({ ...r, rank: i + 1 }))

  return ok({ ranking })
}
