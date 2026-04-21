'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/presentation/components/layout/MobileLayout'
import { useBibleStore, THEMES } from '@/store/bibleStore'
import { getLevelInfo, getTitle, getTotalLevel, LEVEL_TITLES, TOTAL_BIBLE_VERSES } from '@/lib/levelSystem'

interface BookStat {
  bookId: number
  nameKo: string
  testament: string
  totalChapters: number
  totalVerses: number
  readVerses: number
  touchedChapters: number
  percentage: number
}

interface Stats {
  byBook: BookStat[]
  totalVerses: number
  readVerses: number
  overallPct: number
  prestige: number
}

interface RankEntry {
  rank: number
  userId: string
  name: string
  church: string | null
  verseCount: number
  prestige: number
  totalLevel: number
  title: string
  isMe: boolean
}

type Filter = 'all' | 'old' | 'new'
type PageTab = 'my' | 'rank'

const MEDAL = ['🥇', '🥈', '🥉']

export default function ProgressPage() {
  const { status } = useSession()
  const router = useRouter()
  const [pageTab, setPageTab] = useState<PageTab>('my')
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [ranking, setRanking] = useState<RankEntry[]>([])
  const [rankLoading, setRankLoading] = useState(false)
  const [prestiging, setPrestiging] = useState(false)
  const [showTitleInfo, setShowTitleInfo] = useState(false)
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]

  const loadStats = useCallback(() => {
    setIsLoading(true)
    fetch('/api/verse-reads/by-book')
      .then((r) => r.json())
      .then((d) => { if (d.data) setStats(d.data) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    loadStats()
  }, [status, loadStats])

  useEffect(() => {
    if (pageTab !== 'rank' || status !== 'authenticated') return
    if (ranking.length > 0) return
    setRankLoading(true)
    fetch('/api/verse-reads/ranking')
      .then((r) => r.json())
      .then((d) => { if (d.data?.ranking) setRanking(d.data.ranking) })
      .catch(() => {})
      .finally(() => setRankLoading(false))
  }, [pageTab, status])

  const handlePrestige = async () => {
    if (!confirm('통독 전승을 하면 읽은 기록이 초기화되고 레벨이 오릅니다.\n계속하시겠습니까?')) return
    setPrestiging(true)
    const res = await fetch('/api/verse-reads/prestige', { method: 'POST' })
    setPrestiging(false)
    if (!res.ok) {
      const d = await res.json().catch(() => null)
      alert(d?.error?.message ?? '전승 실패')
      return
    }
    setRanking([])
    loadStats()
  }

  const filtered = stats?.byBook.filter((b) =>
    filter === 'old' ? b.testament === 'old' :
    filter === 'new' ? b.testament === 'new' : true
  ) ?? []

  if (status === 'unauthenticated') {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-screen px-8 text-center">
          <p className="text-3xl mb-3">📖</p>
          <p className="text-stone-700 font-semibold mb-1">로그인이 필요합니다</p>
          <p className="text-stone-400 text-xs mb-6">통독 기록을 저장하고 확인하려면 로그인하세요.</p>
          <a href="/auth/login" className="px-8 py-3 text-white text-sm font-semibold rounded-2xl" style={{ backgroundColor: tc.primary }}>로그인 / 회원가입</a>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="pb-6">
        {/* 헤더 */}
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-lg font-bold text-stone-800">통독 기록 - 통독모드에서 읽은 구절을 클릭하면 기록됩니다</h1>
        </div>

        {/* 페이지 탭 */}
        <div className="flex gap-1.5 px-4 mb-4">
          {([['my', '내 기록'], ['rank', '통독 순위']] as [PageTab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setPageTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${pageTab !== t ? 'bg-stone-100 text-stone-500' : 'text-white'}`}
              style={pageTab === t ? { backgroundColor: tc.primary } : undefined}>
              {t === 'rank' ? '🏆 ' : ''}{label}
            </button>
          ))}
        </div>

        {/* ── 내 기록 탭 ── */}
        {pageTab === 'my' && (
          isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 flex-col">
              <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: tc.primary + '33', borderTopColor: tc.primary }} />
              <p className="text-stone-400 text-sm">불러오는 중...</p>
            </div>
          ) : stats ? (
            <>
              {/* 레벨 + 전체 진행률 카드 */}
              {(() => {
                const info = getLevelInfo(stats.readVerses, stats.prestige)
                const isComplete = stats.overallPct >= 100
                const versesPerLevel = TOTAL_BIBLE_VERSES / 200
                // 현재 호칭 idx (prestige 사이클 내)
                const currentTitleIdx = Math.floor((info.verseLevel - 1) / 2)
                // 현재부터 마지막(100번째)까지 모든 호칭 달성 조건
                const remaining100 = 100 - currentTitleIdx
                const titleMilestones = Array.from({ length: remaining100 }, (_, i) => {
                  const idx = currentTitleIdx + i
                  const startVerseLevel = idx * 2 + 1
                  const versesNeeded = Math.ceil((startVerseLevel - 1) * versesPerLevel)
                  const remaining = Math.max(0, versesNeeded - stats.readVerses)
                  return { title: LEVEL_TITLES[idx], versesNeeded, remaining, isCurrent: i === 0 }
                })
                return (
                  <div className="mx-4 mb-4 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                    {/* 레벨(좌) + 호칭 뱃지(우) */}
                    <div className="flex items-start justify-between mb-4">
                      {/* 좌: 레벨 + 절 수 */}
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">현재 레벨</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <p className="text-3xl font-black" style={{ color: tc.primary }}>Lv.{info.totalLevel}</p>
                          {info.prestige > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tc.primary }}>
                              {info.prestige}전승
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-400 mt-1">
                          <span className="font-bold text-stone-700">{stats.readVerses.toLocaleString()}</span>
                          <span className="text-xs"> / {stats.totalVerses.toLocaleString()} 절</span>
                        </p>
                        <p className="text-xs font-bold mt-0.5" style={{ color: tc.primary }}>{stats.overallPct.toFixed(2)}%</p>
                      </div>

                      {/* 우: i 버튼 + 호칭 뱃지 */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => setShowTitleInfo((v) => !v)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-colors shrink-0"
                          style={showTitleInfo
                            ? { backgroundColor: tc.primary, color: '#fff', borderColor: tc.primary }
                            : { backgroundColor: '#f5f5f4', color: '#a8a29e', borderColor: '#e7e5e4' }}>
                          i
                        </button>
                        <div
                          className="relative rounded-2xl px-5 py-3 text-center shadow-md overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${tc.primary}22, ${tc.primary}0d)`,
                            border: `2px solid ${tc.primary}44`,
                          }}>
                          {/* 배경 장식 */}
                          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full opacity-10"
                            style={{ backgroundColor: tc.primary }} />
                          <p className="text-[9px] font-black uppercase tracking-widest mb-0.5"
                            style={{ color: tc.primary + '88' }}>나의 호칭</p>
                          <p className="text-xl font-black leading-tight" style={{ color: tc.primary }}>{info.title}</p>
                        </div>
                      </div>
                    </div>

                    {/* 호칭 달성 조건 인포 패널 */}
                    {showTitleInfo && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-stone-100">
                        <div className="px-3 py-2 text-[10px] font-bold text-stone-400 bg-stone-50 border-b border-stone-100 sticky top-0">
                          호칭 달성 조건 — 읽은 절 수 기준
                        </div>
                        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: '240px' }}>
                        {titleMilestones.map((m, i) => (
                          <div key={i}
                            className="flex items-center gap-3 px-3 py-2.5 border-b border-stone-50 last:border-0"
                            style={m.isCurrent ? { backgroundColor: tc.primary + '0d' } : undefined}>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: m.isCurrent ? tc.primary : '#d6d3d1' }} />
                            <span className="flex-1 text-xs font-bold"
                              style={{ color: m.isCurrent ? tc.primary : '#78716c' }}>
                              {m.title}
                              {m.isCurrent && <span className="ml-1.5 text-[10px] font-semibold opacity-70">← 현재</span>}
                            </span>
                            <span className="text-[10px] text-stone-400 shrink-0">
                              {m.versesNeeded === 0 ? '시작부터' : `${m.versesNeeded.toLocaleString()}절~`}
                              {!m.isCurrent && m.remaining > 0 && (
                                <span className="ml-1 font-semibold" style={{ color: tc.primary }}>
                                  ({m.remaining.toLocaleString()}절 더)
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                        </div>
                      </div>
                    )}

                    {/* 현재 레벨 내 진행 바 */}
                    <div className="mb-1">
                      <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                        <span>레벨 진행</span>
                        <span>{info.progressInLevel.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(info.progressInLevel, 100)}%`, backgroundColor: tc.primary }} />
                      </div>
                    </div>

                    {/* 전체 통독 진행 바 */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                        <span>전체 통독</span>
                        <span>{stats.overallPct.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(stats.overallPct, 100)}%`, backgroundColor: isComplete ? '#22c55e' : tc.primary }} />
                      </div>
                    </div>

                    {/* 통독 전승 버튼 */}
                    {isComplete && (
                      <button
                        onClick={handlePrestige}
                        disabled={prestiging}
                        className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all active:scale-95"
                        style={{ background: `linear-gradient(135deg, #f59e0b, #ef4444)` }}
                      >
                        {prestiging ? '전승 중...' : '🏆 통독 전승 — 레벨 업 & 초기화'}
                      </button>
                    )}
                  </div>
                )
              })()}

              {/* 구약/신약 탭 필터 */}
              <div className="flex gap-1 px-4 mb-3">
                {(['all', 'old', 'new'] as Filter[]).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${filter !== f ? 'bg-stone-100 text-stone-500' : 'text-white'}`}
                    style={filter === f ? { backgroundColor: tc.primary } : undefined}>
                    {f === 'all' ? '전체' : f === 'old' ? '구약' : '신약'}
                  </button>
                ))}
              </div>

              {/* 책별 목록 */}
              <div className="px-4 space-y-2">
                {filtered.map((book) => (
                  <button key={book.bookId}
                    onClick={() => router.push(`/bible/${book.bookId}/1`)}
                    className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-800">{book.nameKo}</span>
                        {book.percentage === 100 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: tc.light, color: tc.primary }}>완독</span>
                        )}
                      </div>
                      <span className="text-sm font-black" style={book.percentage > 0 ? { color: tc.primary } : { color: '#d4d0cb' }}>
                        {book.percentage > 0 ? book.percentage.toFixed(2) : '0'}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden mb-1.5">
                      <div className="h-full rounded-full transition-all"
                        style={book.percentage > 0 ? {
                          width: `${Math.max(book.percentage, 2)}%`,
                          backgroundColor: tc.primary + (book.percentage === 100 ? '' : 'bb'),
                        } : { width: '0%' }} />
                    </div>
                    <p className="text-[10px] text-stone-400">
                      {book.readVerses} / {book.totalVerses}절
                      <span className="mx-1">·</span>
                      {book.touchedChapters}/{book.totalChapters}장 진입
                    </p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📖</p>
              <p className="text-stone-500 font-semibold mb-1">아직 통독 기록이 없습니다</p>
              <p className="text-stone-400 text-xs mb-6">성경 읽기에서 통독모드로 구절을 클릭해보세요</p>
              <button onClick={() => router.push('/bible/1/1')}
                className="px-6 py-2.5 text-white text-sm font-semibold rounded-2xl"
                style={{ backgroundColor: tc.primary }}>
                성경 읽기 시작
              </button>
            </div>
          )
        )}

        {/* ── 통독 순위 탭 ── */}
        {pageTab === 'rank' && (
          rankLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 flex-col">
              <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: tc.primary + '33', borderTopColor: tc.primary }} />
              <p className="text-stone-400 text-sm">순위 불러오는 중...</p>
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-stone-500 font-semibold">아직 순위 데이터가 없습니다</p>
            </div>
          ) : (
            <div className="px-4 space-y-2">
              {ranking.map((entry) => (
                <div key={entry.userId}
                  className="bg-white rounded-2xl border shadow-sm px-4 py-3.5 flex items-center gap-3"
                  style={entry.isMe ? { borderColor: tc.primary, backgroundColor: tc.light } : { borderColor: '#e7e5e4' }}>
                  {/* 순위 */}
                  <div className="shrink-0 w-9 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-2xl leading-none">{MEDAL[entry.rank - 1]}</span>
                    ) : (
                      <span className="text-sm font-black" style={{ color: entry.isMe ? tc.primary : '#a8a29e' }}>{entry.rank}</span>
                    )}
                  </div>

                  {/* 이름 + 호칭 + 교회 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold truncate" style={{ color: entry.isMe ? tc.primary : '#1c1917' }}>
                        {entry.name}
                      </p>
                      {entry.isMe && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: tc.primary }}>나</span>
                      )}
                      {entry.prestige > 0 && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                          {entry.prestige}전승
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: tc.primary + 'bb' }}>{entry.title}</p>
                    {entry.church && <p className="text-xs text-stone-500 truncate mt-0.5">⛪ {entry.church}</p>}
                  </div>

                  {/* 레벨 + 절 수 */}
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold" style={{ color: entry.isMe ? tc.primary : '#78716c' }}>Lv.{entry.totalLevel}</p>
                    <p className="text-base font-black" style={{ color: entry.isMe ? tc.primary : '#44403c' }}>
                      {entry.verseCount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-stone-400">절</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </MobileLayout>
  )
}
