'use client'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/presentation/components/layout/MobileLayout'
import { useBibleStore, THEMES } from '@/store/bibleStore'
import { getLevelInfo } from '@/lib/levelSystem'

const RARITY_COLOR: Record<string, { bg: string; text: string; border: string; label: string }> = {
  common:    { bg: '#f5f5f4', text: '#78716c', border: '#e7e5e4', label: '일반' },
  rare:      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: '레어' },
  epic:      { bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe', label: '에픽' },
  legendary: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: '전설' },
}

const DAILY_VERSES = [
  { text: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라', ref: '살전 5:16-18' },
  { text: '내가 너희에게 평안을 끼치노니 곧 나의 평안을 너희에게 주노라', ref: '요 14:27' },
  { text: '여호와는 나의 목자시니 내게 부족함이 없으리로다', ref: '시 23:1' },
  { text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니', ref: '요 3:16' },
  { text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라', ref: '빌 4:13' },
  { text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다', ref: '시 119:105' },
  { text: '두려워하지 말라 내가 너와 함께 함이라', ref: '사 41:10' },
]

type Profile = {
  name: string | null; email: string; phone: string | null
  church: string | null; region: string | null; bio: string | null
  createdAt: string; prestige?: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]
  const router = useRouter()
  const [tab, setTab] = useState<'stats' | 'badges'>('stats')
  const [stats, setStats] = useState<{
    chaptersRead: number; totalMinutes: number; progressPct: number; streakDays: number
  } | null>(null)
  const [verseStats, setVerseStats] = useState({ read: 0, total: 0 })
  const [prestige, setPrestige] = useState(0)
  const [badges, setBadges] = useState<{
    id: string; code: string; name: string; description: string
    icon: string; rarity: string; earned: boolean; earnedAt: string | null
  }[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '', church: '', region: '' })
  const [saving, setSaving] = useState(false)
  const dailyVerse = DAILY_VERSES[new Date().getDay() % DAILY_VERSES.length]

  useEffect(() => {
    if (status !== 'authenticated') return
    fetchStats()
    fetchBadges()
    fetchProfile()
    fetch('/api/badges/check', { method: 'POST' }).catch(() => {})
    fetch('/api/verse-reads/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) setVerseStats({ read: d.data.readCount ?? 0, total: d.data.totalCount ?? 0 })
      })
      .catch(() => {})
    // prestige 정보
    fetch('/api/verse-reads/by-book')
      .then((r) => r.json())
      .then((d) => { if (d?.data?.prestige != null) setPrestige(d.data.prestige) })
      .catch(() => {})
  }, [status])

  async function fetchStats() {
    const [progressRes, timeRes] = await Promise.all([
      fetch('/api/progress'),
      fetch('/api/reading-time'),
    ])
    const progressData = await progressRes.json().catch(() => null)
    const timeData = await timeRes.json().catch(() => null)
    const summary = progressData?.data?.summary ?? progressData?.data ?? null
    const totalSeconds = timeData?.data?.totalSeconds ?? 0
    const chaptersRead = summary?.readChapters ?? 0
    const progressPct = summary?.percentage ?? Math.round((chaptersRead / 1189) * 100)
    const streakDays = calcStreak(summary?.readDates ?? [])
    setStats({ chaptersRead, totalMinutes: Math.round(totalSeconds / 60), progressPct, streakDays })
  }

  async function fetchBadges() {
    const res = await fetch('/api/badges')
    const data = await res.json().catch(() => null)
    if (data?.data?.badges) setBadges(data.data.badges)
  }

  async function fetchProfile() {
    const res = await fetch('/api/user/profile')
    const data = await res.json().catch(() => null)
    if (data?.data) {
      setProfile(data.data)
      setEditForm({ name: data.data.name ?? '', bio: data.data.bio ?? '', church: data.data.church ?? '', region: data.data.region ?? '' })
    }
  }

  async function handleSaveProfile() {
    setSaving(true)
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const data = await res.json().catch(() => null)
    if (data?.data) setProfile(data.data)
    setSaving(false)
    setShowEditProfile(false)
  }

  if (status === 'loading') return (
    <MobileLayout><div className="flex items-center justify-center h-screen text-stone-400 text-sm">불러오는 중...</div></MobileLayout>
  )

  if (status === 'unauthenticated') return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center h-screen px-8 text-center gap-4">
        <div className="text-6xl">🙏</div>
        <p className="text-stone-600 font-bold text-lg">로그인이 필요합니다</p>
        <p className="text-stone-400 text-sm">성경 읽기 기록을 저장하고 싶으시다면</p>
        <a href="/auth/login" className="px-8 py-3 text-white text-sm font-bold rounded-2xl shadow-sm"
          style={{ backgroundColor: tc.primary }}>로그인 / 회원가입</a>
      </div>
    </MobileLayout>
  )

  const info = getLevelInfo(verseStats.read, prestige)
  const earned = badges.filter((b) => b.earned)
  const notEarned = badges.filter((b) => !b.earned)
  const displayName = profile?.name ?? session?.user?.name ?? '?'

  return (
    <MobileLayout>
      <div className="pb-8">

        {/* ── 프로필 헤더 ── */}
        <div className="px-4 pt-5 pb-4">
          {session?.user.role === 'admin' && (
            <div className="flex justify-end mb-2">
              <button onClick={() => router.push('/admin')}
                className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: tc.light, color: tc.primary }}>
                ⚙️ 관리자 페이지
              </button>
            </div>
          )}

          {/* 아바타 + 이름 */}
          <div className="flex flex-col items-center pt-2 pb-4">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${tc.primary}cc, ${tc.primary})` }}>
                {displayName[0]?.toUpperCase() ?? '?'}
              </div>
              {info.prestige > 0 && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                  {info.prestige}
                </div>
              )}
            </div>
            <p className="text-xl font-black text-stone-800">{displayName}</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: tc.primary }}>
              Lv.{info.totalLevel} · {info.title}
            </p>
            {profile?.church && (
              <p className="text-xs text-stone-400 mt-1">⛪ {profile.church}{profile.region ? ` · 📍 ${profile.region}` : ''}</p>
            )}
            {profile?.bio && (
              <p className="text-sm text-stone-500 mt-2 text-center italic leading-relaxed px-4">"{profile.bio}"</p>
            )}
            <button onClick={() => setShowEditProfile(true)}
              className="mt-3 px-5 py-2 rounded-2xl text-sm font-bold border-2 transition-colors"
              style={{ borderColor: tc.primary + '44', color: tc.primary, backgroundColor: tc.light }}>
              ✏️ 프로필 편집
            </button>
          </div>

          {/* 레벨 진행 바 (간단) */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-400">레벨 진행</span>
              <span className="text-xs font-bold" style={{ color: tc.primary }}>{info.progressInLevel.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${info.progressInLevel}%`, background: `linear-gradient(90deg, ${tc.primary}99, ${tc.primary})` }} />
            </div>
            <div className="flex justify-between text-xs text-stone-400">
              <span>Lv.{info.totalLevel}</span>
              <span>{verseStats.read.toLocaleString()} / {verseStats.total.toLocaleString()} 절</span>
              <span>Lv.{info.totalLevel + 1}</span>
            </div>
          </div>

          {/* 오늘의 말씀 */}
          <div className="rounded-2xl p-4 mb-1" style={{ background: `linear-gradient(135deg, ${tc.primary}15, ${tc.primary}08)`, border: `1px solid ${tc.primary}22` }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: tc.primary }}>✨ 오늘의 말씀</p>
            <p className="text-sm font-semibold text-stone-700 leading-relaxed italic">"{dailyVerse.text}"</p>
            <p className="text-xs font-bold mt-1.5" style={{ color: tc.primary }}>— {dailyVerse.ref}</p>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1.5 px-4 mb-4">
          {(['stats', 'badges'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab !== t ? 'bg-stone-100 text-stone-500' : 'text-white'}`}
              style={tab === t ? { backgroundColor: tc.primary } : undefined}>
              {t === 'stats' ? '📊 활동 통계' : `🏅 뱃지 ${earned.length}/${badges.length}`}
            </button>
          ))}
        </div>

        {/* ── 활동 통계 ── */}
        {tab === 'stats' && (
          <div className="px-4 space-y-3">
            {/* 4개 통계 카드 */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon="📖" label="읽은 구절" value={verseStats.read.toLocaleString()} sub="절" tc={tc} />
              <StatCard icon="🔥" label="연속 읽기" value={String(stats?.streakDays ?? 0)} sub="일" tc={tc} />
              <StatCard icon="✅" label="완독 장" value={String(stats?.chaptersRead ?? 0)} sub="장" tc={tc} />
              <StatCard icon="⏱️" label="누적 시간"
                value={stats && stats.totalMinutes >= 60
                  ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`
                  : String(stats?.totalMinutes ?? 0)}
                sub={stats && stats.totalMinutes >= 60 ? '' : '분'} tc={tc} />
            </div>

            {/* 전체 통독 진행 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-stone-600">📚 전체 통독 진행</p>
                <span className="text-sm font-black" style={{ color: tc.primary }}>{stats?.progressPct ?? 0}%</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(stats?.progressPct ?? 0, 100)}%`, background: `linear-gradient(90deg, ${tc.primary}aa, ${tc.primary})` }} />
              </div>
              <p className="text-xs text-stone-400 mt-2">전체 1189장 중 <span className="font-bold" style={{ color: tc.primary }}>{stats?.chaptersRead ?? 0}장</span> 완료</p>
            </div>

            {/* 응원 문구 */}
            {(stats?.streakDays ?? 0) >= 3 && (
              <div className="rounded-2xl p-4 text-center" style={{ background: `linear-gradient(135deg, ${tc.primary}22, ${tc.primary}11)` }}>
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-sm font-bold" style={{ color: tc.primary }}>{stats!.streakDays}일 연속 통독 중!</p>
                <p className="text-xs text-stone-500 mt-0.5">꾸준함이 최고의 신앙입니다</p>
              </div>
            )}
          </div>
        )}

        {/* ── 뱃지 ── */}
        {tab === 'badges' && (
          <div className="px-4 space-y-4">
            {badges.length === 0 && (
              <div className="text-center py-10">
                <p className="text-4xl mb-2">🏅</p>
                <p className="text-stone-500 font-semibold">아직 뱃지가 없습니다</p>
                <p className="text-stone-400 text-sm mt-1">말씀을 읽으면 뱃지를 얻을 수 있어요!</p>
              </div>
            )}

            {earned.length > 0 && (
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">획득 완료 ✨ {earned.length}개</p>
                <div className="space-y-2">
                  {earned.map((b) => {
                    const r = RARITY_COLOR[b.rarity] ?? RARITY_COLOR.common
                    return (
                      <div key={b.id} className="flex items-center gap-3 p-4 rounded-2xl border"
                        style={{ backgroundColor: r.bg, borderColor: r.border }}>
                        <span className="text-3xl shrink-0">{b.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold" style={{ color: r.text }}>{b.name}</p>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: r.text + '22', color: r.text }}>{r.label}</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{b.description}</p>
                        </div>
                        <span className="text-lg shrink-0">✅</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {notEarned.length > 0 && (
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">도전 중 🎯 {notEarned.length}개</p>
                <div className="space-y-2">
                  {notEarned.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 p-4 rounded-2xl border border-stone-100 bg-stone-50">
                      <span className="text-3xl shrink-0 grayscale opacity-40">{b.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-stone-400">{b.name}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{b.description}</p>
                      </div>
                      <span className="text-stone-300 text-lg shrink-0">🔒</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 로그아웃 */}
        <div className="px-4 mt-6">
          <button onClick={async () => { await signOut({ redirect: false }); window.location.href = '/auth/login' }}
            className="w-full py-3 rounded-2xl text-sm font-bold text-red-500 border-2 border-red-100 active:bg-red-50 transition-colors">
            로그아웃
          </button>
        </div>

        {/* 회원 탈퇴 */}
        <div className="flex justify-center mt-3">
          <button onClick={async () => {
            if (!confirm('정말 탈퇴하시겠습니까?\n모든 읽기 기록, 노트, 게시글이 영구 삭제됩니다.')) return
            const res = await fetch('/api/user/withdraw', { method: 'DELETE' })
            if (res.ok) { await signOut({ redirect: false }); window.location.href = '/auth/login' }
            else alert('오류가 발생했습니다.')
          }} className="text-xs text-stone-400 underline underline-offset-2 py-2">
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* 프로필 편집 (TopBar 유지) */}
      {showEditProfile && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col bg-stone-50">
          <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-stone-100 shrink-0">
            <button onClick={() => setShowEditProfile(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-stone-500 active:bg-stone-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="flex-1 text-base font-bold text-stone-800">프로필 편집</h2>
            <button onClick={handleSaveProfile} disabled={saving}
              className="px-4 py-2 text-white text-sm font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
              style={{ backgroundColor: tc.primary }}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[
              { key: 'name', label: '이름', placeholder: '이름을 입력하세요', icon: '👤' },
              { key: 'church', label: '교회', placeholder: '소속 교회 (선택)', icon: '⛪' },
              { key: 'region', label: '지역', placeholder: '거주 지역 (선택)', icon: '📍' },
            ].map(({ key, label, placeholder, icon }) => (
              <div key={key}>
                <label className="text-xs font-bold text-stone-400 mb-1.5 block">{icon} {label}</label>
                <input type="text" value={editForm[key as keyof typeof editForm]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-base placeholder-stone-300 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': tc.primary + '4d' } as React.CSSProperties} />
              </div>
            ))}
            <div>
              <label className="text-xs font-bold text-stone-400 mb-1.5 block">✍️ 자기소개</label>
              <textarea value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="한 줄 자기소개를 입력하세요"
                rows={3}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-base placeholder-stone-300 focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': tc.primary + '4d' } as React.CSSProperties} />
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}

function StatCard({ icon, label, value, sub, tc }: {
  icon: string; label: string; value: string; sub: string
  tc: { primary: string; light: string }
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <p className="text-xs font-bold text-stone-400">{label}</p>
      </div>
      <p className="text-2xl font-black" style={{ color: tc.primary }}>
        {value}<span className="text-sm font-normal text-stone-400 ml-1">{sub}</span>
      </p>
    </div>
  )
}

function calcStreak(readDates: string[]): number {
  if (!readDates.length) return 0
  const dates = Array.from(new Set(readDates)).sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let expected = today
  for (const date of dates) {
    if (date === expected) {
      streak++
      const d = new Date(expected)
      d.setDate(d.getDate() - 1)
      expected = d.toISOString().slice(0, 10)
    } else if (date < expected) {
      break
    }
  }
  return streak
}
