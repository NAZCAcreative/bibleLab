import { NextRequest } from 'next/server'
import { ok, unauthorized, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/user/settings — 폰트/사이즈 설정 불러오기
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fontFamily: true, fontSize: true },
  })

  return ok({ fontFamily: user?.fontFamily ?? null, fontSize: user?.fontSize ?? null })
}

// PUT /api/user/settings — 폰트/사이즈 설정 저장
export async function PUT(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => ({}))
  const { fontFamily, fontSize } = body

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(fontFamily !== undefined && { fontFamily }),
        ...(fontSize !== undefined && { fontSize }),
      },
    })
    return ok({ ok: true })
  } catch {
    return serverError()
  }
}
