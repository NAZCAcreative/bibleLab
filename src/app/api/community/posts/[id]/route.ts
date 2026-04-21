import { NextRequest } from 'next/server'
import { ok, unauthorized, notFound, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/community/posts/[id] — 단건 조회 + 조회수 증가
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, church: true, bio: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!post) return notFound()
    await prisma.post.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})
    return ok(post)
  } catch {
    return serverError()
  }
}

// PATCH /api/community/posts/[id] — 수정 (본인 또는 관리자)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { userId: true } })
  if (!post) return notFound()

  const isAdmin = session.user.role === 'admin'
  if (post.userId !== session.user.id && !isAdmin) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body) return badRequest('잘못된 요청입니다.')

  const VALID_CATEGORIES = ['general', 'prayer', 'testimony', 'question']

  try {
    const updated = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim().slice(0, 100) } : {}),
        ...(body.content !== undefined ? { content: body.content.trim().slice(0, 5000) } : {}),
        ...(body.category !== undefined && VALID_CATEGORIES.includes(body.category) ? { category: body.category } : {}),
        ...(isAdmin && body.isPinned !== undefined ? { isPinned: body.isPinned } : {}),
      },
      include: { user: { select: { id: true, name: true } } },
    })
    return ok(updated)
  } catch {
    return serverError()
  }
}

// DELETE /api/community/posts/[id] — 삭제 (본인 또는 관리자)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { userId: true } })
  if (!post) return notFound()

  if (post.userId !== session.user.id && session.user.role !== 'admin') return unauthorized()

  try {
    await prisma.post.delete({ where: { id: params.id } })
    return ok({ deleted: true })
  } catch {
    return serverError()
  }
}
