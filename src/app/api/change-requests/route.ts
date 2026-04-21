import { NextRequest } from 'next/server'
import { ok, created, unauthorized, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

const ALLOWED_FIELDS = ['name', 'phone', 'church', 'region', 'bio']

// GET /api/change-requests — 내 요청 목록
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const requests = await prisma.changeRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return ok(requests)
}

// POST /api/change-requests — 수정 요청 생성
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.field || !body?.requestedValue?.trim()) return badRequest('필드와 요청값을 입력해주세요.')
  if (!ALLOWED_FIELDS.includes(body.field)) return badRequest('수정 불가능한 필드입니다.')

  // 현재 값 조회
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const currentValue = user ? String(user[body.field as keyof typeof user] ?? '') : ''

  // 이미 pending 요청이 있으면 거부
  const existing = await prisma.changeRequest.findFirst({
    where: { userId: session.user.id, field: body.field, status: 'pending' },
  })
  if (existing) return badRequest('해당 항목의 수정 요청이 이미 처리 중입니다.')

  try {
    const request = await prisma.changeRequest.create({
      data: {
        userId: session.user.id,
        field: body.field,
        currentValue,
        requestedValue: body.requestedValue.trim(),
        reason: body.reason?.trim() ?? null,
      },
    })
    return created(request)
  } catch {
    return serverError()
  }
}
