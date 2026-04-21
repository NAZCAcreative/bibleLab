import { NextRequest } from 'next/server'
import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/memos?bookId=X&chapter=Y  → { memoColors: { [verseId]: colorKey } }
export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const { searchParams } = new URL(req.url)
  const bookId = Number(searchParams.get('bookId'))
  const chapter = Number(searchParams.get('chapter'))
  if (!bookId || !chapter) return ok({ memoColors: {} })

  try {
    const verses = await prisma.verse.findMany({
      where: { bookId, chapter },
      select: { id: true },
    })
    const verseIds = verses.map((v: { id: string }) => v.id)

    const memos = await prisma.memo.findMany({
      where: { userId: session.user.id, verseId: { in: verseIds } },
      select: { verseId: true, color: true, content: true },
    })

    const memoColors: Record<string, string> = {}
    const memoContents: Record<string, string> = {}
    for (const m of memos) {
      memoColors[m.verseId] = m.color
      memoContents[m.verseId] = m.content
    }

    return ok({ memoColors, memoContents })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[memos GET]', msg)
    return Response.json({ error: { message: msg } }, { status: 500 })
  }
}
