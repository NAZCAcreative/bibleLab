'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/presentation/components/layout/MobileLayout'
import { useBibleStore, THEMES } from '@/store/bibleStore'
import { getReadingLevel, LEVEL_TITLES, TOTAL_BIBLE_VERSES } from '@/lib/levelSystem'

const TOTAL_VERSES = TOTAL_BIBLE_VERSES
const PAGE_SIZE = 20

const CATEGORIES = [
  { value: 'all',       label: '전체',    icon: '📋' },
  { value: 'general',   label: '자유',    icon: '💬' },
  { value: 'prayer',    label: '기도제목', icon: '🙏' },
  { value: 'testimony', label: '간증',    icon: '✨' },
  { value: 'question',  label: '질문',    icon: '❓' },
]

const CATEGORY_META: Record<string, { label: string; icon: string; bg: string; text: string; writeBg: string }> = {
  general:   { label: '자유',    icon: '💬', bg: 'bg-stone-100',   text: 'text-stone-600',   writeBg: 'bg-stone-50' },
  prayer:    { label: '기도제목', icon: '🙏', bg: 'bg-blue-50',    text: 'text-blue-700',    writeBg: 'bg-blue-50' },
  testimony: { label: '간증',    icon: '✨', bg: 'bg-emerald-50', text: 'text-emerald-700', writeBg: 'bg-emerald-50' },
  question:  { label: '질문',    icon: '❓', bg: 'bg-purple-50',  text: 'text-purple-700',  writeBg: 'bg-purple-50' },
}

const WRITE_PLACEHOLDERS: Record<string, string[]> = {
  general: [
    '오늘 하루 어떠셨나요? 자유롭게 나눠주세요 😊',
    '마음에 떠오르는 이야기를 적어보세요',
    '신앙 생활 중 작은 기쁨이 있으셨나요?',
  ],
  prayer: [
    '함께 기도할 제목을 나눠주세요 🙏',
    '중보기도가 필요하신가요? 말씀해주세요',
    '기도 응답 경험을 나눠주셔도 좋아요',
  ],
  testimony: [
    '하나님의 은혜를 경험하셨나요? ✨',
    '삶에서 일어난 기적 같은 일을 나눠주세요',
    '말씀을 통해 변화된 이야기를 들려주세요',
  ],
  question: [
    '성경이나 신앙에 대해 궁금한 점이 있으신가요? ❓',
    '함께 고민해볼 질문을 올려주세요',
    '어떤 질문이든 괜찮아요, 편하게 물어보세요',
  ],
}

function getReadingTime(content: string): string {
  const chars = content.replace(/\s/g, '').length
  const minutes = Math.max(1, Math.round(chars / 250))
  return `약 ${minutes}분`
}

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 2 * 60 * 60 * 1000
}

function isHot(commentCount: number, viewCount: number): boolean {
  return commentCount >= 5 || viewCount >= 50
}

type Post = {
  id: string; title: string; content: string; category: string
  viewCount: number; createdAt: string; isPinned: boolean; showBio: boolean
  user: { name: string | null; bio: string | null; _count: { verseReads: number } }
  _count: { comments: number }
}

export default function CommunityPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]
  const [category, setCategory] = useState('all')
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showWrite, setShowWrite] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'general', showBio: true })
  const [submitting, setSubmitting] = useState(false)
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * 3))
  const [showLevelInfo, setShowLevelInfo] = useState(false)

  const fetchPosts = useCallback(async (cat: string, pg: number) => {
    setLoading(true)
    const res = await fetch(`/api/community/posts?category=${cat}&page=${pg}&take=${PAGE_SIZE}`)
    const data = await res.json().catch(() => null)
    if (data?.data) {
      setPosts(data.data.posts ?? [])
      setTotal(data.data.total ?? 0)
      setTotalPages(data.data.totalPages ?? 1)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts(category, page) }, [category, page, fetchPosts])

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    setPage(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    if (res.ok) {
      const data = await res.json()
      setShowWrite(false)
      setForm({ title: '', content: '', category: 'general', showBio: true })
      router.push(`/community/${data.data.id}`)
    }
  }

  return (
    <MobileLayout>
      <div className="pb-6">
        {/* 헤더 */}
        <div className="px-4 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-stone-800">소통 게시판</h1>
            <p className="text-xs text-stone-400 mt-0.5">총 {total.toLocaleString()}개의 이야기</p>
          </div>
          {session && (
            <button onClick={() => setShowWrite(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-bold rounded-2xl shadow-sm active:scale-95 transition-transform"
              style={{ backgroundColor: tc.primary }}>
              ✏️ 글쓰기
            </button>
          )}
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => {
            const active = category === c.value
            return (
              <button key={c.value} onClick={() => handleCategoryChange(c.value)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-colors"
                style={active
                  ? { backgroundColor: tc.primary, color: '#fff' }
                  : { backgroundColor: '#f5f5f4', color: '#78716c' }}>
                <span>{c.icon}</span>{c.label}
              </button>
            )
          })}
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: tc.primary + '33', borderTopColor: tc.primary }} />
            <p className="text-stone-400 text-sm">불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-5xl mb-4">✝️</p>
            <p className="font-bold text-stone-600 text-base mb-1">아직 이야기가 없습니다</p>
            <p className="text-sm text-stone-400 mb-1">첫 번째 글을 남겨주세요</p>
            <p className="text-xs text-stone-300 italic">"항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라" — 살전 5:16-18</p>
          </div>
        ) : (
          <>
            <div className="px-4 space-y-3">
              {posts.map((post) => {
                const meta = CATEGORY_META[post.category]
                const hot = isHot(post._count.comments, post.viewCount)
                const newPost = isNew(post.createdAt)
                const readTime = getReadingTime(post.content)
                return (
                  <button key={post.id} onClick={() => router.push(`/community/${post.id}`)}
                    className="w-full text-left rounded-2xl bg-white border overflow-hidden active:scale-[0.99] transition-transform"
                    style={post.isPinned
                      ? { borderColor: tc.primary + '55', boxShadow: `0 0 0 1px ${tc.primary}22, 0 2px 12px ${tc.primary}15` }
                      : { borderColor: '#e7e5e4', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

                    {/* 핀 배너 */}
                    {post.isPinned && (
                      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: tc.primary + '12' }}>
                        <svg className="w-3.5 h-3.5 shrink-0" style={{ color: tc.primary }} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                        </svg>
                        <span className="text-xs font-black tracking-wide" style={{ color: tc.primary }}>공지사항</span>
                      </div>
                    )}

                    <div className="px-4 pt-3.5 pb-3.5">
                      {/* 카테고리 + 뱃지 + 날짜 */}
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta?.bg ?? 'bg-stone-100'} ${meta?.text ?? 'text-stone-500'}`}>
                          {meta?.icon} {meta?.label ?? post.category}
                        </span>
                        {newPost && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-500 animate-pulse">NEW</span>
                        )}
                        {hot && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-50 text-orange-500">🔥 인기</span>
                        )}
                        <span className="text-xs text-stone-400 ml-auto">{formatDate(post.createdAt)}</span>
                      </div>

                      {/* 제목 */}
                      <p className="text-base font-bold text-stone-800 leading-snug mb-2 line-clamp-2">{post.title}</p>

                      {/* 본문 미리보기 */}
                      <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{post.content}</p>

                      {/* 읽기 시간 */}
                      <p className="text-xs text-stone-300 mt-1.5">{readTime} 읽기</p>

                      {/* 하단: 작성자 + 통계 */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                            style={{ backgroundColor: tc.primary }}>
                            {(post.user.name ?? '익')[0]}
                          </div>
                          <span className="text-sm font-semibold text-stone-700 truncate">{post.user.name ?? '익명'}</span>
                          <LevelBadge versesRead={post.user._count.verseReads} onInfoClick={() => setShowLevelInfo(true)} />
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1 text-sm"
                            style={{ color: post._count.comments > 0 ? tc.primary : '#a8a29e', fontWeight: post._count.comments > 0 ? 700 : 400 }}>
                            💬 {post._count.comments}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-stone-400">
                            👁 <span className="font-semibold">{post.viewCount}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-5 px-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30"
                  style={{ backgroundColor: '#f5f5f4', color: '#78716c' }}>
                  ‹
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // 현재 페이지 중심으로 최대 5개 표시
                  const half = 2
                  let start = Math.max(1, page - half)
                  const end = Math.min(totalPages, start + 4)
                  start = Math.max(1, end - 4)
                  return start + i
                }).filter((p) => p <= totalPages).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors"
                    style={p === page
                      ? { backgroundColor: tc.primary, color: '#fff' }
                      : { backgroundColor: '#f5f5f4', color: '#78716c' }}>
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30"
                  style={{ backgroundColor: '#f5f5f4', color: '#78716c' }}>
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 글쓰기 모달 */}
      {showWrite && (
        <div className="fixed inset-0 z-50 flex flex-col bg-stone-50">
          <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-stone-100 shrink-0">
            <button onClick={() => setShowWrite(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-stone-500 active:bg-stone-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="flex-1 text-base font-bold text-stone-800">새 글 작성</h2>
            <button onClick={handleSubmit} disabled={submitting || !form.title.trim() || !form.content.trim()}
              className="px-4 py-2 text-white text-sm font-bold rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
              style={{ backgroundColor: tc.primary }}>
              {submitting ? '등록 중...' : '등록'}
            </button>
          </header>

          <form className="flex-1 overflow-y-auto p-4 space-y-3" onSubmit={handleSubmit}>
            {/* 카테고리 선택 */}
            <div>
              <p className="text-xs font-bold text-stone-400 mb-2">카테고리 선택</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                  <button key={c.value} type="button"
                    onClick={() => setForm((f) => ({ ...f, category: c.value }))}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    style={form.category === c.value
                      ? { backgroundColor: tc.primary, color: '#fff' }
                      : { backgroundColor: '#f5f5f4', color: '#78716c' }}>
                    <span>{c.icon}</span>{c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 격려 문구 */}
            {form.category !== 'all' && (
              <div className={`px-4 py-3 rounded-2xl text-sm ${CATEGORY_META[form.category]?.bg ?? 'bg-stone-50'} ${CATEGORY_META[form.category]?.text ?? 'text-stone-500'}`}>
                {WRITE_PLACEHOLDERS[form.category]?.[placeholderIdx]}
              </div>
            )}

            <input type="text" placeholder="제목을 입력하세요"
              value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-base placeholder-stone-300 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': tc.primary + '4d' } as React.CSSProperties} />

            <div className="relative">
              <textarea
                value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={10} maxLength={5000}
                placeholder="마음을 담아 적어주세요..."
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-base placeholder-stone-300 focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': tc.primary + '4d' } as React.CSSProperties} />
              <span className="absolute bottom-3 right-4 text-xs text-stone-300 pointer-events-none">
                {form.content.length}/5000
              </span>
            </div>

            {/* 자기소개 표시 */}
            <button type="button"
              onClick={() => setForm((f) => ({ ...f, showBio: !f.showBio }))}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all active:scale-[0.99]"
              style={form.showBio
                ? { borderColor: tc.primary + 'aa', backgroundColor: tc.light }
                : { borderColor: '#e7e5e4', backgroundColor: '#fff' }}>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: form.showBio ? tc.primary : '#374151' }}>👤 내 자기소개 표시</p>
                <p className="text-xs text-stone-400 mt-0.5">게시글에 프로필 소개를 함께 표시합니다</p>
              </div>
              <div className="rounded-full transition-colors flex items-center px-0.5 shrink-0 ml-3"
                style={{ backgroundColor: form.showBio ? tc.primary : '#e7e5e4', height: '26px', width: '48px' }}>
                <div className="w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: form.showBio ? 'translateX(22px)' : 'translateX(0)' }} />
              </div>
            </button>
          </form>
        </div>
      )}

      {/* 호칭 단계 레이어 팝업 */}
      {showLevelInfo && <LevelInfoModal onClose={() => setShowLevelInfo(false)} />}
    </MobileLayout>
  )
}

function LevelBadge({ versesRead, onInfoClick }: { versesRead: number; onInfoClick?: () => void }) {
  const { theme } = useBibleStore()
  const tc = THEMES[theme]
  const info = getReadingLevel(versesRead, TOTAL_VERSES)
  return (
    <span
      role="button"
      onClick={(e) => { e.stopPropagation(); onInfoClick?.() }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold leading-none shrink-0 mb-1.5 cursor-pointer"
      style={{ backgroundColor: tc.light, color: tc.primary }}>
      <span>{info.emoji}</span><span>{info.title}</span>
    </span>
  )
}

function LevelInfoModal({ onClose }: { onClose: () => void }) {
  const { theme } = useBibleStore()
  const tc = THEMES[theme]
  const versesPerTitle = TOTAL_BIBLE_VERSES / 100

  const TIERS = [
    { label: '🌱 초보 (1–30)', range: [0, 29] },
    { label: '🌿 성장 (31–50)', range: [30, 49] },
    { label: '📚 탐구 (51–70)', range: [50, 69] },
    { label: '🔥 영웅 (71–90)', range: [70, 89] },
    { label: '⭐ 전설 (91–100)', range: [90, 99] },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="bg-stone-50 rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 bg-stone-300 rounded-full" />
        </div>
        <header className="flex items-center justify-between px-4 h-11 shrink-0">
          <h2 className="text-base font-bold text-stone-800">📖 호칭 단계 안내</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 active:bg-stone-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <p className="text-xs text-stone-400 px-4 pb-2 shrink-0">구절을 읽을수록 호칭이 올라갑니다</p>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 space-y-3 min-h-0">
          {TIERS.map(({ label, range }) => (
            <div key={label} className="bg-white rounded-2xl overflow-hidden border border-stone-100">
              <div className="px-3 py-2 text-xs font-black text-stone-500 border-b border-stone-100"
                style={{ backgroundColor: tc.light }}>{label}</div>
              {LEVEL_TITLES.slice(range[0], range[1] + 1).map((title, i) => {
                const idx = range[0] + i
                const versesNeeded = Math.ceil(idx * versesPerTitle)
                return (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 border-b border-stone-50 last:border-0">
                    <span className="text-sm font-bold" style={{ color: tc.primary }}>{title}</span>
                    <span className="text-xs text-stone-400">{versesNeeded === 0 ? '시작' : `${versesNeeded.toLocaleString()}절~`}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}시간 전`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
