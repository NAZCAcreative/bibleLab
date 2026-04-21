import { NextRequest } from 'next/server'
import { ok, unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// PATCH /api/admin/liturgy/[id]  body: { content, version? }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.content?.trim()) return badRequest('내용을 입력해주세요.')

  const existing = await prisma.liturgyText.findUnique({ where: { id: params.id } })
  if (!existing) return notFound('기도문을 찾을 수 없습니다.')

  try {
    const updated = await prisma.liturgyText.update({
      where: { id: params.id },
      data: {
        content: body.content.trim(),
        ...(body.version ? { version: body.version.trim() } : {}),
        updatedBy: session.user.id,
      },
    })
    return ok(updated)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[liturgy PATCH]', msg)
    return serverError()
  }
}
