// Design Ref: §4.1 — GET/POST /api/highlights
import { NextRequest } from 'next/server'
import { ok, created, unauthorized, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { UpsertHighlightUseCase } from '@/application/use-cases/highlight/UpsertHighlightUseCase'
import { PrismaHighlightRepository } from '@/infrastructure/db/prisma/PrismaHighlightRepository'

const highlightRepo = new PrismaHighlightRepository()
const upsertUseCase = new UpsertHighlightUseCase(highlightRepo)

export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const highlights = await highlightRepo.getByUser(session.user.id)
  return ok(highlights)
}

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.verseId || !body?.color) {
    return badRequest('verseId와 color는 필수입니다.', {
      verseId: !body?.verseId ? ['필수 항목입니다.'] : [],
      color: !body?.color ? ['필수 항목입니다.'] : [],
    })
  }

  try {
    const highlight = await upsertUseCase.execute({
      userId: session.user.id,
      verseId: body.verseId,
      color: body.color,
    })
    return created(highlight)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '오류가 발생했습니다.'
    return badRequest(msg)
  }
}
