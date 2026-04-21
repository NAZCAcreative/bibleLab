import { NextRequest } from 'next/server'
import { created, unauthorized, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// POST /api/community/posts/[id]/comments
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.content?.trim()) return badRequest('댓글 내용을 입력해주세요.')

  try {
    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        postId: params.id,
        content: body.content.trim().slice(0, 1000),
      },
      include: { user: { select: { id: true, name: true } } },
    })
    return created(comment)
  } catch {
    return serverError()
  }
}
