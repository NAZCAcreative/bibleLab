import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/infrastructure/db/client'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // CredentialsProvider + JWT 전략에서는 PrismaAdapter 제거
  // (adapter + credentials + jwt 조합은 쿠키 미설정 버그 유발)
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },
  providers: [
    CredentialsProvider({
      name: '이메일',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        // 로그인 기록
        await prisma.userActivityLog.create({
          data: { userId: user.id, action: 'login' },
        }).catch(() => {})

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? 'user'
      }
      return session
    },
  },
}

declare module 'next-auth' {
  interface Session {
    user: { id: string; email: string; name?: string | null; image?: string | null; role: string }
  }
}
