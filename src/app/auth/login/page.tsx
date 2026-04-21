'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (res?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } else {
      router.push('/bible/1/1')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage: "url('/images/backgroundImg_01.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 반투명 오버레이 */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <Image
            src="/images/logo_01.PNG"
            alt="BibleLab"
            width={200}
            height={40}
            style={{ height: '60px', width: 'auto' }}
            className="mx-auto mb-3 drop-shadow-lg"
          />
          <p className="text-white/80 text-sm font-medium drop-shadow">말씀과 함께하는 매일</p>
        </div>

        {/* 폼 카드 */}
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
          <h2 className="text-lg font-bold text-stone-800 mb-6">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#1a3d5c66' } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#1a3d5c66' } as React.CSSProperties}
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white font-semibold rounded-2xl transition-colors disabled:opacity-50 shadow-md active:opacity-80"
              style={{ backgroundColor: '#1a3d5c' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-stone-400 text-sm">계정이 없으신가요? </span>
            <Link href="/auth/register" className="font-semibold text-sm hover:underline" style={{ color: '#1a3d5c' }}>
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
