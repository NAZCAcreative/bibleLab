import { NextRequest } from 'next/server'
import { ok, unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// PATCH /api/admin/users/[id] — 정지/복구
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()
  if (params.id === session.user.id) return badRequest('자기 자신은 변경할 수 없습니다.')

  const body = await req.json().catch(() => null)
  if (!body?.status || !['active', 'suspended'].includes(body.status)) return badRequest('status는 active 또는 suspended 여야 합니다.')

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!user) return notFound()

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { status: body.status },
      select: { id: true, email: true, name: true, status: true },
    })
    return ok(updated)
  } catch {
    return serverError()
  }
}

// DELETE /api/admin/users/[id] — 회원 탈퇴 처리 (useYn = false, 데이터 보존)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()
  if (params.id === session.user.id) return badRequest('자기 자신은 처리할 수 없습니다.')

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, useYn: true } })
    if (!user) return notFound()

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { useYn: false },
      select: { id: true, email: true, name: true, useYn: true },
    })
    return ok(updated)
  } catch {
    return serverError()
  }
}
