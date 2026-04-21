import { NextRequest } from 'next/server'
import { ok, unauthorized, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/admin/posts?page=&search=&category=
export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const take = 20

  const where: Record<string, unknown> = {}
  if (category && category !== 'all') where.category = category
  if (search) where.OR = [
    { title: { contains: search } },
    { content: { contains: search } },
    { user: { name: { contains: search } } },
  ]

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { comments: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * take,
        take,
      }),
      prisma.post.count({ where }),
    ])
    return ok({ posts, total, page, totalPages: Math.ceil(total / take) })
  } catch {
    return serverError()
  }
}
