'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const REGIONS = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주', '해외']
const PRIMARY = '#1a3d5c'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    name: '', email: '', password: '', passwordConfirm: '',
    phone: '', gender: '', birthYear: '', church: '', region: '',
    agreedToTerms: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  const validateStep1 = () => {
    if (!form.name.trim()) return '이름을 입력해주세요.'
    if (!form.email) return '이메일을 입력해주세요.'
    if (form.password.length < 6) return '비밀번호는 6자 이상이어야 합니다.'
    if (form.password !== form.passwordConfirm) return '비밀번호가 일치하지 않습니다.'
    return ''
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.agreedToTerms) { setError('이용약관에 동의해주세요.'); return }
    setError('')
    setLoading(true)

    const res = await fetch('/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        gender: form.gender,
        birthYear: form.birthYear ? Number(form.birthYear) : undefined,
        church: form.church,
        region: form.region,
        agreedToTerms: form.agreedToTerms,
      }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error ?? '오류가 발생했습니다.'); setLoading(false); return }

    const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    setLoading(false)
    if (signInRes?.error) {
      setError('회원가입 완료. 로그인 페이지에서 로그인해주세요.')
    } else {
      router.push('/bible/1/1')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-6 py-10"
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
        <div className="mb-6 text-center">
          <Image
            src="/images/logo_01.PNG"
            alt="BibleLab"
            width={200}
            height={40}
            style={{ height: '60px', width: 'auto' }}
            className="mx-auto mb-2 drop-shadow-lg"
          />
          <p className="text-white/80 text-xs font-medium drop-shadow">말씀과 함께하는 매일</p>
        </div>

        <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-7">
          {/* 단계 표시 */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: step >= 1 ? PRIMARY : '#e7e5e4' }} />
            <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: step >= 2 ? PRIMARY : '#e7e5e4' }} />
          </div>

          {step === 1 ? (
            <div>
              <h2 className="text-base font-bold text-stone-800 mb-5">기본 정보 <span className="text-xs text-stone-400 font-normal">(1/2)</span></h2>
              <div className="space-y-4">
                <Field label="이름 *">
                  <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="홍길동" className={INPUT} />
                </Field>
                <Field label="이메일 *">
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="your@email.com" className={INPUT} />
                </Field>
                <Field label="비밀번호 *">
                  <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="6자 이상" className={INPUT} />
                </Field>
                <Field label="비밀번호 확인 *">
                  <input type="password" value={form.passwordConfirm} onChange={(e) => set('passwordConfirm', e.target.value)} placeholder="동일한 비밀번호" className={INPUT} />
                </Field>
              </div>
              {error && <p className="text-red-500 text-xs bg-red-50 px-4 py-2.5 rounded-xl mt-4">{error}</p>}
              <button type="button" onClick={handleNext}
                className="w-full mt-6 py-3.5 text-white font-semibold rounded-2xl transition-colors disabled:opacity-50 shadow-md active:opacity-80 text-sm"
                style={{ backgroundColor: PRIMARY }}>
                다음
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-base font-bold text-stone-800 mb-5">추가 정보 <span className="text-xs text-stone-400 font-normal">(2/2)</span></h2>
              <div className="space-y-4">
                <Field label="연락처">
                  <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="010-0000-0000" className={INPUT} />
                </Field>
                <Field label="성별">
                  <div className="flex gap-2">
                    {[['male', '남성'], ['female', '여성'], ['other', '기타']].map(([v, l]) => (
                      <button key={v} type="button" onClick={() => set('gender', v)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border"
                        style={form.gender === v
                          ? { borderColor: PRIMARY, backgroundColor: PRIMARY + '18', color: PRIMARY }
                          : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="출생연도">
                  <input type="number" value={form.birthYear} onChange={(e) => set('birthYear', e.target.value)} placeholder="예: 1990" min="1900" max={new Date().getFullYear()} className={INPUT} />
                </Field>
                <Field label="소속 교회">
                  <input type="text" value={form.church} onChange={(e) => set('church', e.target.value)} placeholder="교회명 (선택)" className={INPUT} />
                </Field>
                <Field label="지역">
                  <select value={form.region} onChange={(e) => set('region', e.target.value)} className={INPUT}>
                    <option value="">선택 (선택)</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>

                <label className="flex items-start gap-3 cursor-pointer mt-2">
                  <div
                    onClick={() => set('agreedToTerms', !form.agreedToTerms)}
                    className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={form.agreedToTerms
                      ? { borderColor: PRIMARY, backgroundColor: PRIMARY }
                      : { borderColor: '#d1d5db' }}>
                    {form.agreedToTerms && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-xs text-stone-600 leading-relaxed">
                    <span className="font-semibold" style={{ color: PRIMARY }}>이용약관</span> 및 <span className="font-semibold" style={{ color: PRIMARY }}>개인정보처리방침</span>에 동의합니다 <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 px-4 py-2.5 rounded-xl mt-4">{error}</p>}

              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 text-sm font-semibold">
                  이전
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 text-white text-sm font-semibold rounded-2xl transition-colors disabled:opacity-50 shadow-md active:opacity-80"
                  style={{ backgroundColor: PRIMARY }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />처리 중...
                    </span>
                  ) : '가입 완료'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 text-center">
            <span className="text-stone-400 text-sm">이미 계정이 있으신가요? </span>
            <Link href="/auth/login" className="font-semibold text-sm" style={{ color: PRIMARY }}>로그인</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-stone-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const INPUT = 'w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition'
