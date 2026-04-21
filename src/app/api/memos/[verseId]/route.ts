// Design Ref: §4.1 — GET/PUT/DELETE /api/memos/[verseId]
import { NextRequest } from 'next/server'
import { ok, created, unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { PrismaMemoRepository } from '@/infrastructure/db/prisma/PrismaMemoRepository'

const memoRepo = new PrismaMemoRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: { verseId: string } }
) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  try {
    const memo = await memoRepo.getByVerse(session.user.id, params.verseId)
    return ok(memo ?? null)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[memos GET verseId]', msg)
    return serverError()
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { verseId: string } }
) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.content?.trim()) {
    return badRequest('내용을 입력해주세요.', { content: ['필수 항목입니다.'] })
  }

  try {
    const memo = await memoRepo.upsert({
      userId: session.user.id,
      verseId: params.verseId,
      content: body.content,
      color: typeof body.color === 'string' ? body.color : undefined,
    })
    return created(memo)
  } catch {
    return serverError()
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { verseId: string } }
) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  // verseId로 먼저 조회 후 삭제
  const memo = await memoRepo.getByVerse(session.user.id, params.verseId)
  if (!memo) return notFound('메모가 없습니다.')

  await memoRepo.delete(memo.id, session.user.id)
  return ok({ deleted: true })
}
