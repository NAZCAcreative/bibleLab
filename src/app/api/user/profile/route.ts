import { ok, unauthorized, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// PATCH /api/user/profile — 프로필 수정
export async function PATCH(req: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  try {
    const body = await req.json()
    const { bio, name, church, region } = body
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(bio !== undefined ? { bio: bio.trim() || null } : {}),
        ...(name !== undefined ? { name: name.trim() || null } : {}),
        ...(church !== undefined ? { church: church.trim() || null } : {}),
        ...(region !== undefined ? { region: region.trim() || null } : {}),
      },
      select: { name: true, email: true, phone: true, church: true, region: true, bio: true, createdAt: true },
    })
    return ok(updated)
  } catch {
    return serverError()
  }
}

// GET /api/user/profile — 전체 프로필 조회
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        gender: true,
        birthYear: true,
        church: true,
        region: true,
        bio: true,
        createdAt: true,
      },
    })
    return ok(user ?? {})
  } catch {
    return serverError()
  }
}
