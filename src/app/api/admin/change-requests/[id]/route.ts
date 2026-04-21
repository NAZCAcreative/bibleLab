import { NextRequest } from 'next/server'
import { ok, unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// PATCH /api/admin/change-requests/[id]
// body: { status: 'approved'|'rejected', adminNote? }  — 승인/거부
// body: { action: 'restore' }                          — 원본 복원
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body) return badRequest('요청 본문이 없습니다.')

  const cr = await prisma.changeRequest.findUnique({ where: { id: params.id } })
  if (!cr) return notFound('요청을 찾을 수 없습니다.')

  // ── 원본 복원 ──
  if (body.action === 'restore') {
    if (cr.status !== 'approved') return badRequest('승인된 요청만 복원할 수 있습니다.')
    if (!cr.currentValue) return badRequest('원본 값이 저장되어 있지 않습니다.')

    try {
      await prisma.$transaction(async (tx) => {
        if (cr.type === 'verse' && cr.verseId) {
          await tx.verse.update({
            where: { id: cr.verseId },
            data: { [cr.field]: cr.currentValue },
          })
        } else {
          await tx.user.update({
            where: { id: cr.userId },
            data: { [cr.field]: cr.currentValue },
          })
        }
        await tx.changeRequest.update({
          where: { id: params.id },
          data: { status: 'restored', adminNote: `복원됨 by ${session.user.email}` },
        })
      })
      return ok({ restored: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[change-request restore]', msg)
      return serverError()
    }
  }

  // ── 승인 / 거부 ──
  if (!body.status || !['approved', 'rejected'].includes(body.status)) {
    return badRequest('status는 approved 또는 rejected여야 합니다.')
  }
  if (cr.status !== 'pending') return badRequest('이미 처리된 요청입니다.')

  try {
    await prisma.$transaction(async (tx) => {
      await tx.changeRequest.update({
        where: { id: params.id },
        data: {
          status: body.status,
          adminNote: body.adminNote ?? null,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      })

      if (body.status === 'approved') {
        if (cr.type === 'verse' && cr.verseId) {
          await tx.verse.update({
            where: { id: cr.verseId },
            data: { [cr.field]: cr.requestedValue },
          })
        } else {
          await tx.user.update({
            where: { id: cr.userId },
            data: { [cr.field]: cr.requestedValue },
          })
        }
      }
    })

    return ok({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[change-request approve]', msg)
    return Response.json({ error: { message: msg } }, { status: 500 })
  }
}
