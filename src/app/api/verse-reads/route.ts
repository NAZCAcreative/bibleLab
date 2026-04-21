import { NextRequest } from 'next/server'
import { ok, unauthorized, badRequest } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/verse-reads?bookId=&chapter= — 해당 챕터의 읽은 구절 ID 목록
export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const { searchParams } = new URL(req.url)
  const bookId = Number(searchParams.get('bookId'))
  const chapter = Number(searchParams.get('chapter'))
  if (!bookId || !chapter) return badRequest('bookId, chapter 필요')

  const verses = await prisma.verse.findMany({
    where: { bookId, chapter },
    select: { id: true },
  })
  const verseIds = verses.map((v) => v.id)

  const reads = await prisma.verseRead.findMany({
    where: { userId: session.user.id, verseId: { in: verseIds } },
    select: { verseId: true },
  })

  return ok({ readVerseIds: reads.map((r) => r.verseId) })
}

// POST /api/verse-reads — 구절 읽음 토글
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.verseId) return badRequest('verseId 필요')

  const existing = await prisma.verseRead.findUnique({
    where: { userId_verseId: { userId: session.user.id, verseId: body.verseId } },
  })

  if (existing) {
    await prisma.verseRead.delete({ where: { id: existing.id } })
    return ok({ read: false })
  } else {
    await prisma.verseRead.create({
      data: { userId: session.user.id, verseId: body.verseId },
    })

    // 챕터의 모든 구절을 읽었으면 readingProgress 자동 기록
    const verse = await prisma.verse.findUnique({
      where: { id: body.verseId },
      select: { bookId: true, chapter: true },
    })
    if (verse) {
      const [totalVerses, readCount] = await Promise.all([
        prisma.verse.count({ where: { bookId: verse.bookId, chapter: verse.chapter } }),
        prisma.verseRead.count({
          where: {
            userId: session.user.id,
            verse: { bookId: verse.bookId, chapter: verse.chapter },
          },
        }),
      ])
      if (readCount >= totalVerses) {
        await prisma.readingProgress.upsert({
          where: { userId_bookId_chapter: { userId: session.user.id, bookId: verse.bookId, chapter: verse.chapter } },
          create: { userId: session.user.id, bookId: verse.bookId, chapter: verse.chapter },
          update: {},
        })
      }
    }

    return ok({ read: true })
  }
}
