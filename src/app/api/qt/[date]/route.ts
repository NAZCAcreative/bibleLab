// Design Ref: §4.1 — GET/PUT/DELETE /api/qt/[date] (YYYY-MM-DD)
import { NextRequest } from 'next/server'
import { ok, created, unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { PrismaQTNoteRepository } from '@/infrastructure/db/prisma/PrismaQTNoteRepository'
import { UpsertQTNoteUseCase } from '@/application/use-cases/qt/UpsertQTNoteUseCase'

const qtRepo = new PrismaQTNoteRepository()
const upsertUseCase = new UpsertQTNoteUseCase(qtRepo)

function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { date: string } }
) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const date = parseDate(params.date)
  if (!date) return badRequest('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)')

  const note = await qtRepo.getByDate(session.user.id, date)
  if (!note) return notFound('해당 날짜의 묵상 노트가 없습니다.')
  return ok(note)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const date = parseDate(params.date)
  if (!date) return badRequest('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)')

  const body = await req.json().catch(() => null)
  if (!body?.content?.trim()) {
    return badRequest('묵상 내용을 입력해주세요.', { content: ['필수 항목입니다.'] })
  }

  try {
    const note = await upsertUseCase.execute({
      userId: session.user.id,
      date,
      verseRef: body.verseRef,
      content: body.content,
    })
    return created(note)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '오류가 발생했습니다.'
    return badRequest(msg)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { date: string } }
) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const date = parseDate(params.date)
  if (!date) return badRequest('날짜 형식이 올바르지 않습니다.')

  const note = await qtRepo.getByDate(session.user.id, date)
  if (!note) return notFound('해당 날짜의 묵상 노트가 없습니다.')

  await qtRepo.delete(note.id, session.user.id)
  return ok({ deleted: true })
}
