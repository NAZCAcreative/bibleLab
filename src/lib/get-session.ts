// Design Ref: §7 — 서버 컴포넌트/Route Handler에서 세션 가져오기
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user?.id) return null
  return session
}
