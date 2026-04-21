import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/badges — 전체 뱃지 + 내가 획득한 뱃지
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const [allBadges, myBadges] = await Promise.all([
    prisma.badge.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
    }),
  ])

  const earnedIds = new Set(myBadges.map((ub) => ub.badgeId))

  return ok({
    badges: allBadges.map((b) => ({
      ...b,
      earned: earnedIds.has(b.id),
      earnedAt: myBadges.find((ub) => ub.badgeId === b.id)?.earnedAt ?? null,
    })),
  })
}
