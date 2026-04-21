import { NextRequest } from 'next/server'
import { ok, unauthorized, badRequest } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// POST /api/reading-time — 읽기 시간 기록
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.bookId || !body?.chapter || !body?.duration) return badRequest('필수값 누락')

  const duration = Number(body.duration)
  if (duration < 5) return ok({ skipped: true }) // 5초 미만은 무시

  await prisma.readingTimeLog.create({
    data: {
      userId: session.user.id,
      bookId: Number(body.bookId),
      chapter: Number(body.chapter),
      duration,
    },
  })

  return ok({ ok: true })
}

// GET /api/reading-time — 총 읽기 시간 (초)
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const result = await prisma.readingTimeLog.aggregate({
    where: { userId: session.user.id },
    _sum: { duration: true },
  })

  return ok({ totalSeconds: result._sum.duration ?? 0 })
}
