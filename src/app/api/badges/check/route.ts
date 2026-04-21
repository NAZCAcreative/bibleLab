import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// POST /api/badges/check — 뱃지 조건 체크 후 신규 획득 뱃지 반환
export async function POST() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const userId = session.user.id

  const [progress, memos, existingBadges] = await Promise.all([
    prisma.readingProgress.findMany({ where: { userId } }),
    prisma.memo.count({ where: { userId } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badge: { select: { code: true } } } }),
  ])

  const earned = new Set(existingBadges.map((ub: { badge: { code: string } }) => ub.badge.code))
  const readChapters = progress.length

  // 신약 완독: bookId 40-66 (신약 27권)
  const newTestamentBooks = new Set(progress.filter((p: { bookId: number }) => p.bookId >= 40).map((p: { bookId: number }) => p.bookId))
  const oldTestamentBooks = new Set(progress.filter((p: { bookId: number }) => p.bookId < 40).map((p: { bookId: number }) => p.bookId))

  // 연속 읽기 계산
  const readDates = Array.from(new Set(progress.map((p: { readAt: Date }) => p.readAt.toISOString().slice(0, 10)))).sort()
  let maxStreak = 1, currentStreak = 1
  for (let i = 1; i < readDates.length; i++) {
    const prev = new Date(readDates[i - 1])
    const curr = new Date(readDates[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (diff === 1) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak) }
    else { currentStreak = 1 }
  }

  const CONDITIONS: [string, boolean][] = [
    ['first_step',    readChapters >= 1],
    ['chapters_10',   readChapters >= 10],
    ['chapters_50',   readChapters >= 50],
    ['chapters_150',  readChapters >= 150],
    ['memo_5',        memos >= 5],
    ['streak_7',      maxStreak >= 7],
    ['streak_30',     maxStreak >= 30],
    ['streak_100',    maxStreak >= 100],
    ['new_testament', newTestamentBooks.size >= 27],
    ['old_testament', oldTestamentBooks.size >= 39],
    ['bible_complete', newTestamentBooks.size >= 27 && oldTestamentBooks.size >= 39],
  ]

  const newCodes = CONDITIONS.filter(([code, cond]) => cond && !earned.has(code)).map(([code]) => code)

  if (newCodes.length === 0) return ok({ newBadges: [] })

  const badges = await prisma.badge.findMany({ where: { code: { in: newCodes } } })
  await prisma.userBadge.createMany({
    data: badges.map((b) => ({ userId, badgeId: b.id })),
    skipDuplicates: true,
  })

  return ok({ newBadges: badges })
}
