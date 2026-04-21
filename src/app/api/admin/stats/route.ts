import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// GET /api/admin/stats — 전체 통계
export async function GET() {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalUsers,
    todayLogins,
    monthLogins,
    totalProgress,
    totalPosts,
    pendingRequests,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.userActivityLog.count({ where: { action: 'login', createdAt: { gte: today } } }),
    prisma.userActivityLog.count({ where: { action: 'login', createdAt: { gte: thisMonth } } }),
    prisma.readingProgress.count(),
    prisma.post.count(),
    prisma.changeRequest.count({ where: { status: 'pending' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        church: true,
        region: true,
        role: true,
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
          },
        },
      },
    }),
  ])

  return ok({
    totalUsers,
    todayLogins,
    monthLogins,
    totalProgress,
    totalPosts,
    pendingRequests,
    recentUsers,
  })
}
