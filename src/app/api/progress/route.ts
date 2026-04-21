// Design Ref: §4.1 — GET/POST /api/progress
// Plan SC: FR-08 — 1독 진행률
import { NextRequest } from 'next/server'
import { ok, created, unauthorized, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { PrismaReadingProgressRepository } from '@/infrastructure/db/prisma/PrismaReadingProgressRepository'
import { MarkChapterReadUseCase } from '@/application/use-cases/progress/MarkChapterReadUseCase'
import { ReadingProgressService } from '@/application/services/ReadingProgressService'

const progressRepo = new PrismaReadingProgressRepository()
const markReadUseCase = new MarkChapterReadUseCase(progressRepo)
const progressService = new ReadingProgressService()

export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const records = await progressRepo.getProgress(session.user.id)
  const summary = progressService.calculateSummary(records)
  return ok(summary)
}

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.bookId || !body?.chapter) {
    return badRequest('bookId와 chapter는 필수입니다.')
  }

  try {
    const progress = await markReadUseCase.execute({
      userId: session.user.id,
      bookId: Number(body.bookId),
      chapter: Number(body.chapter),
    })
    // 갱신된 진행률 함께 반환
    const records = await progressRepo.getProgress(session.user.id)
    const summary = progressService.calculateSummary(records)
    return created({ progress, summary })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '오류가 발생했습니다.'
    return badRequest(msg)
  }
}
