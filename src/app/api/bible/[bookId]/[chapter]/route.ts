// Design Ref: §4.1 — GET /api/bible/[bookId]/[chapter]
import { NextRequest } from 'next/server'
import { ok, badRequest, serverError } from '@/lib/api-response'
import { GetChapterUseCase } from '@/application/use-cases/bible/GetChapterUseCase'
import { PrismaBibleRepository } from '@/infrastructure/db/prisma/PrismaBibleRepository'

const bibleRepo = new PrismaBibleRepository()
const getChapterUseCase = new GetChapterUseCase(bibleRepo)

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookId: string; chapter: string } }
) {
  const bookId = parseInt(params.bookId)
  const chapter = parseInt(params.chapter)

  if (isNaN(bookId) || isNaN(chapter)) {
    return badRequest('bookId와 chapter는 숫자여야 합니다.')
  }

  try {
    const result = await getChapterUseCase.execute({ bookId, chapter })
    return ok(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '오류가 발생했습니다.'
    if (msg.startsWith('Invalid')) return badRequest(msg)
    return serverError()
  }
}
