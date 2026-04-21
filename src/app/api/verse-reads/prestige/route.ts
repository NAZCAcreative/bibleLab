import { ok, unauthorized, badRequest } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// POST /api/verse-reads/prestige — 통독 전승 (초기화 + prestige++)
export async function POST() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const verseCount = await prisma.verseRead.count({ where: { userId: session.user.id } })
  const total = 31102
  if (verseCount < total) return badRequest('통독을 100% 완료해야 전승할 수 있습니다.')

  const user = await prisma.$transaction(async (tx) => {
    await tx.verseRead.deleteMany({ where: { userId: session.user.id } })
    return tx.user.update({
      where: { id: session.user.id },
      data: { prestige: { increment: 1 } },
      select: { prestige: true },
    })
  })

  return ok({ prestige: user.prestige })
}
