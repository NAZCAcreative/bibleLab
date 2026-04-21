import { ok, unauthorized, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// DELETE /api/user/withdraw — 본인 계정 탈퇴
export async function DELETE() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  try {
    await prisma.user.delete({ where: { id: session.user.id } })
    return ok({ deleted: true })
  } catch {
    return serverError()
  }
}
