import { NextRequest } from 'next/server'
import { created, unauthorized, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// POST /api/verse-corrections — 구절 수정 요청 제출
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.verseId || !body?.field || !body?.requestedValue?.trim()) {
    return badRequest('verseId, field, requestedValue 필요')
  }
  if (!['textKo', 'textEn'].includes(body.field)) {
    return badRequest('field는 textKo 또는 textEn이어야 합니다.')
  }

  const verse = await prisma.verse.findUnique({ where: { id: body.verseId } })
  if (!verse) return badRequest('구절을 찾을 수 없습니다.')

  // 이미 대기 중인 요청 확인
  const existing = await prisma.changeRequest.findFirst({
    where: { userId: session.user.id, verseId: body.verseId, field: body.field, status: 'pending' },
  })
  if (existing) return badRequest('해당 구절에 이미 검토 중인 수정 요청이 있습니다.')

  try {
    const cr = await prisma.changeRequest.create({
      data: {
        userId: session.user.id,
        type: 'verse',
        field: body.field,
        verseId: body.verseId,
        currentValue: body.field === 'textKo' ? verse.textKo : verse.textEn,
        requestedValue: body.requestedValue.trim(),
        reason: body.reason?.trim() ?? null,
      },
    })
    return created(cr)
  } catch {
    return serverError()
  }
}
