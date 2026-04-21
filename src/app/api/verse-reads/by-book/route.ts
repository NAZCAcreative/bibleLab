import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/verse-reads/by-book — 책별 통독 진행률
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  // 사용자가 읽은 모든 구절 (verseId 목록)
  const [reads, userRow] = await Promise.all([
    prisma.verseRead.findMany({
      where: { userId: session.user.id },
      select: { verseId: true },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { prestige: true } }),
  ])
  const prestige = userRow?.prestige ?? 0
  const readVerseIds = new Set(reads.map((r) => r.verseId))

  // 모든 구절 (bookId, chapter 포함)
  const allVerses = await prisma.verse.findMany({
    select: { id: true, bookId: true, chapter: true },
    orderBy: [{ bookId: 'asc' }, { chapter: 'asc' }],
  })

  // 책 정보
  const books = await prisma.book.findMany({
    select: { id: true, nameKo: true, totalChapters: true, testament: true },
    orderBy: { id: 'asc' },
  })

  // 책별 집계
  const bookMap = new Map<number, { total: number; read: number; chapters: Set<number> }>()
  for (const v of allVerses) {
    if (!bookMap.has(v.bookId)) bookMap.set(v.bookId, { total: 0, read: 0, chapters: new Set() })
    const entry = bookMap.get(v.bookId)!
    entry.total++
    if (readVerseIds.has(v.id)) {
      entry.read++
      entry.chapters.add(v.chapter)
    }
  }

  const byBook = books.map((b) => {
    const entry = bookMap.get(b.id) ?? { total: 0, read: 0, chapters: new Set() }
    return {
      bookId: b.id,
      nameKo: b.nameKo,
      testament: b.testament,
      totalChapters: b.totalChapters,
      totalVerses: entry.total,
      readVerses: entry.read,
      touchedChapters: entry.chapters.size,
      percentage: entry.total > 0 ? Math.round((entry.read / entry.total) * 10000) / 100 : 0,
    }
  })

  const totalVerses = byBook.reduce((s, b) => s + b.totalVerses, 0)
  const readVerses = byBook.reduce((s, b) => s + b.readVerses, 0)
  const overallPct = totalVerses > 0 ? Math.round((readVerses / totalVerses) * 10000) / 100 : 0

  return ok({ byBook, totalVerses, readVerses, overallPct, prestige })
}
