import { NextRequest } from 'next/server'
import { ok, created, unauthorized, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/community/posts?category=&page=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') ?? undefined
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const take = Math.min(50, Math.max(1, Number(searchParams.get('take') ?? '20')))

  const where = category && category !== 'all' ? { category } : {}

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, church: true, bio: true, _count: { select: { verseReads: true } } } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * take,
      take,
    }),
    prisma.post.count({ where }),
  ])

  return ok({ posts, total, page, totalPages: Math.ceil(total / take) })
}

// POST /api/community/posts
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.title?.trim() || !body?.content?.trim()) return badRequest('제목과 내용을 입력해주세요.')

  const VALID_CATEGORIES = ['general', 'prayer', 'testimony', 'question']
  const category = VALID_CATEGORIES.includes(body.category) ? body.category : 'general'
  const showBio = body.showBio === true

  try {
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        title: body.title.trim().slice(0, 100),
        content: body.content.trim().slice(0, 5000),
        category,
        showBio,
      },
      include: { user: { select: { id: true, name: true } } },
    })
    return created(post)
  } catch {
    return serverError()
  }
}
