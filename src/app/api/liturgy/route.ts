import { ok, serverError } from '@/lib/api-response'
import { prisma } from '@/infrastructure/db/client'

// GET /api/liturgy → { creed: [...], prayer: [...] }
export async function GET() {
  try {
    const rows = await prisma.liturgyText.findMany({
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    })
    const creed = rows.filter((r) => r.type === 'creed')
    const prayer = rows.filter((r) => r.type === 'prayer')
    return ok({ creed, prayer })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[liturgy GET]', msg)
    return serverError()
  }
}
