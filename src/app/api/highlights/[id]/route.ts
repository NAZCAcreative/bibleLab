// Design Ref: §4.1 — DELETE /api/highlights/[id]
import { NextRequest } from 'next/server'
import { ok, unauthorized, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { PrismaHighlightRepository } from '@/infrastructure/db/prisma/PrismaHighlightRepository'

const highlightRepo = new PrismaHighlightRepository()

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  try {
    await highlightRepo.delete(params.id, session.user.id)
    return ok({ deleted: true })
  } catch {
    return serverError()
  }
}
