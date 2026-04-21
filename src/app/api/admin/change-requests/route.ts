import { NextRequest } from 'next/server'
import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/admin/change-requests?status=pending
export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'

  const requests = await prisma.changeRequest.findMany({
    where: status === 'all' ? {} : { status },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // 구절 수정 요청에 구절 정보(책/장/절) 첨부
  const verseIds = requests.map((r) => r.verseId).filter(Boolean) as string[]
  const verseMap: Record<string, { bookId: number; chapter: number; verse: number; nameKo: string }> = {}
  if (verseIds.length > 0) {
    const verses = await prisma.verse.findMany({
      where: { id: { in: verseIds } },
      select: { id: true, bookId: true, chapter: true, verse: true, book: { select: { nameKo: true } } },
    })
    for (const v of verses) verseMap[v.id] = { bookId: v.bookId, chapter: v.chapter, verse: v.verse, nameKo: v.book.nameKo }
  }

  const enriched = requests.map((r) => ({
    ...r,
    verseInfo: r.verseId ? (verseMap[r.verseId] ?? null) : null,
  }))

  return ok(enriched)
}
