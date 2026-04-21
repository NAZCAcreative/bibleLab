// Design Ref: §4.1 — GET /api/bible/search?q=&lang=
// Plan SC: FR-03 — 키워드 검색
import { NextRequest } from 'next/server'
import { ok, badRequest, serverError } from '@/lib/api-response'
import { SearchVersesUseCase } from '@/application/use-cases/bible/SearchVersesUseCase'
import { PrismaBibleRepository } from '@/infrastructure/db/prisma/PrismaBibleRepository'

const bibleRepo = new PrismaBibleRepository()
const searchUseCase = new SearchVersesUseCase(bibleRepo)

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = searchParams.get('q') ?? ''
  const lang = searchParams.get('lang') ?? 'ko'

  try {
    const verses = await searchUseCase.execute({ query, lang })
    return ok(verses)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '오류가 발생했습니다.'
    return badRequest(msg)
  }
}
