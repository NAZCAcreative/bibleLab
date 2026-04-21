'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<'splash' | 'login'>('splash')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPhase('login'), 3200)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } else {
      const cb = searchParams.get('callbackUrl')
      router.push(cb && cb.startsWith('/') ? cb : '/bible/1/1')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/backgroundImg_01.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0a1628',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      {/* 신성 기하학 패턴 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          animation: phase === 'splash'
            ? 'sacredFadeIn 1.5s ease-out forwards'
            : 'sacredFadeOut 1s ease-in forwards',
        }}
      >
        <SacredGeometry />
      </div>

      <style>{`
        @keyframes sacredFadeIn {
          from { opacity: 0; transform: scale(0.85) rotate(-10deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes sacredFadeOut {
          from { opacity: 1; transform: scale(1) rotate(0deg); }
          to   { opacity: 0; transform: scale(1.1) rotate(5deg); }
        }
        @keyframes logoIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes formIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* 로고 */}
        <div
          className="mb-8 text-center"
          style={{ animation: 'logoIn 1.2s ease-out 0.3s both' }}
        >
          <Image
            src="/images/logo_01.PNG"
            alt="BibleLab"
            width={200}
            height={40}
            style={{ height: '64px', width: 'auto' }}
            className="mx-auto mb-3 drop-shadow-2xl"
            priority
          />
          <p className="text-white/70 text-sm font-medium tracking-widest drop-shadow">
            말씀과 함께하는 매일
          </p>
        </div>

        {/* 로그인 폼 */}
        {phase === 'login' && (
          <div
            className="w-full max-w-sm"
            style={{ animation: 'formIn 0.7s ease-out both' }}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8">
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

              <div className="mt-4 text-center">
                <span className="text-stone-400 text-sm">계정이 없으신가요? </span>
                <Link href="/auth/register" className="font-semibold text-sm hover:underline" style={{ color: '#1a3d5c' }}>
                  회원가입
                </Link>
              </div>
            </div>

            {/* 로그인 없이 읽기 */}
            <Link
              href="/bible/1/1"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white/80 text-sm font-semibold border border-white/20 backdrop-blur-sm active:opacity-70 transition-opacity"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <BookIcon className="w-4 h-4" />
              로그인 없이 성경만 읽기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function SacredGeometry() {
  const cx = 160
  const cy = 160
  const r = 54
  const color = 'rgba(255,220,120,0.55)'
  const stroke = 'rgba(255,220,120,0.35)'

  // Flower of Life: center + 6 petals
  const angles = [0, 60, 120, 180, 240, 300]
  const centers = angles.map((a) => ({
    x: cx + r * Math.cos((a * Math.PI) / 180),
    y: cy + r * Math.sin((a * Math.PI) / 180),
  }))

  return (
    <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 바깥 큰 원 */}
      <circle cx={cx} cy={cy} r={r * 3.2} stroke={stroke} strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={r * 2.6} stroke={stroke} strokeWidth="0.6" />

      {/* 헥사그램 (Star of David) */}
      {[0, 60].map((rot, i) => (
        <polygon
          key={i}
          points={angles.map((a) => {
            const rad = ((a + rot) * Math.PI) / 180
            return `${cx + r * 1.85 * Math.cos(rad)},${cy + r * 1.85 * Math.sin(rad)}`
          }).join(' ')}
          stroke={color}
          strokeWidth="0.9"
          fill="none"
        />
      ))}

      {/* 꽃 무늬 원 (Flower of Life) */}
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth="1" fill="rgba(255,220,120,0.04)" />
      {centers.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={r} stroke={color} strokeWidth="1" fill="rgba(255,220,120,0.03)" />
      ))}

      {/* 중심 작은 원들 */}
      <circle cx={cx} cy={cy} r={r * 0.35} stroke={color} strokeWidth="0.8" fill="rgba(255,220,120,0.06)" />
      <circle cx={cx} cy={cy} r={r * 0.12} fill={color} />

      {/* 방사형 선 */}
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180
        return (
          <line
            key={i}
            x1={cx + r * 0.12 * Math.cos(rad)}
            y1={cy + r * 0.12 * Math.sin(rad)}
            x2={cx + r * 2.55 * Math.cos(rad)}
            y2={cy + r * 2.55 * Math.sin(rad)}
            stroke={stroke}
            strokeWidth="0.6"
          />
        )
      })}

      {/* 외곽 점 장식 */}
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180
        return (
          <circle
            key={i}
            cx={cx + r * 2.6 * Math.cos(rad)}
            cy={cy + r * 2.6 * Math.sin(rad)}
            r={3}
            fill={color}
          />
        )
      })}
    </svg>
  )
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}
