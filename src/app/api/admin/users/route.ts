import { NextRequest } from 'next/server'
import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/admin/users?page=&search=&searchType=all|name|email|date
export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search') ?? ''
  const searchType = searchParams.get('searchType') ?? 'all'
  const take = 20

  let where: Record<string, unknown> = {}
  if (search) {
    if (searchType === 'name') {
      where = { name: { contains: search } }
    } else if (searchType === 'email') {
      where = { email: { contains: search } }
    } else if (searchType === 'date') {
      const d = new Date(search)
      if (!isNaN(d.getTime())) {
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
        where = { createdAt: { gte: start, lt: end } }
      }
    } else {
      where = { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * take,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        church: true,
        region: true,
        role: true,
        status: true,
        createdAt: true,
        activityLogs: {
          where: { action: 'login' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
        _count: {
          select: {
            activityLogs: { where: { action: 'login' } },
            readingProgress: true,
            highlights: true,
            qtNotes: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return ok({ users, total, page, totalPages: Math.ceil(total / take) })
}
