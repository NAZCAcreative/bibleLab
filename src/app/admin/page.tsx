'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/presentation/components/layout/MobileLayout'
import { useBibleStore, THEMES } from '@/store/bibleStore'

type AdminStats = {
  totalUsers: number
  todayLogins: number
  monthLogins: number
  totalProgress: number
  totalPosts: number
  pendingRequests: number
  recentUsers: {
    id: string; name: string | null; email: string; church: string | null
    region: string | null; role: string; createdAt: string
    activityLogs: { createdAt: string }[]
    _count: { activityLogs: number; readingProgress: number }
  }[]
}

type ChangeRequest = {
  id: string; type: string; field: string; currentValue: string | null
  requestedValue: string; reason: string | null; status: string; createdAt: string
  verseId: string | null; user: { id: string; name: string | null; email: string }
  verseInfo: { bookId: number; chapter: number; verse: number; nameKo: string } | null
}

type Post = {
  id: string; title: string; content: string; category: string
  isPinned: boolean; viewCount: number; createdAt: string
  user: { id: string; name: string | null; email: string }
  _count: { comments: number }
}

type User = {
  id: string; name: string | null; email: string; church: string | null
  region: string | null; role: string; status: string; createdAt: string
  activityLogs: { createdAt: string }[]
  _count: { activityLogs: number; readingProgress: number }
}

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'general', label: '자유' },
  { value: 'prayer', label: '기도제목' },
  { value: 'testimony', label: '간증' },
  { value: 'question', label: '질문' },
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]

  const [tab, setTab] = useState<'stats' | 'users' | 'posts' | 'requests' | 'liturgy' | 'config'>('stats')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userSearchType, setUserSearchType] = useState<'all' | 'name' | 'email' | 'date'>('all')
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [posts, setPosts] = useState<Post[]>([])
  const [postSearch, setPostSearch] = useState('')
  const [postCategory, setPostCategory] = useState('all')
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [requestStatus, setRequestStatus] = useState('pending')
  const [adminNote, setAdminNote] = useState<Record<string, string>>({})

  // 앱 설정
  type LangKey = 'ko' | 'en' | 'narrative' | 'easy'
  type LangVisibility = Record<LangKey, boolean>
  const LANG_LABELS: Record<LangKey, string> = { ko: '개역 (한국어)', en: 'KJV (영어)', narrative: '이야기 성경 (서사)', easy: '쉬운 현대어' }
  const [langVisibility, setLangVisibility] = useState<LangVisibility>({ ko: true, en: true, narrative: true, easy: true })
  const [communityVisible, setCommunityVisible] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)

  // 기도문 관리
  type LiturgyItem = { id: string; type: string; version: string; content: string; isDefault: boolean }
  const [liturgyTexts, setLiturgyTexts] = useState<{ creed: LiturgyItem[]; prayer: LiturgyItem[] }>({ creed: [], prayer: [] })
  const [liturgyTab, setLiturgyTab] = useState<'creed' | 'prayer'>('creed')
  const [editLiturgy, setEditLiturgy] = useState<LiturgyItem | null>(null)
  const [liturgyEditContent, setLiturgyEditContent] = useState('')
  const [savingLiturgy, setSavingLiturgy] = useState(false)

  // 게시글 편집 모달
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [editForm, setEditForm] = useState({ title: '', content: '', category: 'general' })
  const [savingPost, setSavingPost] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'admin') router.push('/profile')
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user.role !== 'admin') return
    fetchStats()
  }, [status, session])

  useEffect(() => {
    if (tab === 'users') fetchUsers()
    if (tab === 'posts') fetchPosts()
    if (tab === 'requests') fetchRequests()
    if (tab === 'liturgy') fetchLiturgy()
    if (tab === 'config') fetchConfig()
  }, [tab, requestStatus])

  async function fetchStats() {
    const res = await fetch('/api/admin/stats')
    const data = await res.json().catch(() => null)
    if (data?.data) setStats(data.data)
  }

  async function fetchUsers(page = userPage) {
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}&searchType=${userSearchType}&page=${page}`)
    const data = await res.json().catch(() => null)
    if (data?.data?.users) {
      setUsers(data.data.users)
      setUserPage(data.data.page)
      setUserTotalPages(data.data.totalPages)
    }
  }

  async function suspendUser(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    const label = nextStatus === 'suspended' ? '정지' : '복구'
    if (!confirm(`이 회원을 ${label}하시겠습니까?`)) return
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    fetchUsers()
  }

  async function deleteUser(id: string) {
    if (!confirm('이 회원을 탈퇴 처리하시겠습니까?\n(useYn=false, 데이터는 보존됩니다)')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    fetchUsers()
    fetchStats()
  }

  async function fetchPosts() {
    const res = await fetch(`/api/admin/posts?search=${postSearch}&category=${postCategory}`)
    const data = await res.json().catch(() => null)
    if (data?.data?.posts) setPosts(data.data.posts)
  }

  async function fetchRequests() {
    const res = await fetch(`/api/admin/change-requests?status=${requestStatus}`)
    const data = await res.json().catch(() => null)
    if (Array.isArray(data?.data)) setRequests(data.data)
  }

  async function reviewRequest(id: string, action: 'approved' | 'rejected') {
    const res = await fetch(`/api/admin/change-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action, adminNote: adminNote[id] ?? '' }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => null)
      alert(d?.error?.message ?? '처리 실패')
    }
    fetchRequests()
    fetchStats()
  }

  async function restoreRequest(id: string) {
    if (!confirm('원본 값으로 복원하시겠습니까?')) return
    const res = await fetch(`/api/admin/change-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore' }),
    })
    if (!res.ok) { const d = await res.json(); alert(d.error?.message ?? '복원 실패') }
    fetchRequests()
  }

  async function deletePost(id: string) {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    await fetch(`/api/community/posts/${id}`, { method: 'DELETE' })
    fetchPosts()
    fetchStats()
  }

  async function togglePin(post: Post) {
    await fetch(`/api/community/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !post.isPinned }),
    })
    fetchPosts()
  }

  async function fetchLiturgy() {
    const res = await fetch('/api/liturgy')
    const data = await res.json().catch(() => null)
    if (data?.data) setLiturgyTexts(data.data)
  }

  async function fetchConfig() {
    const res = await fetch('/api/settings')
    const data = await res.json().catch(() => null)
    if (data?.data?.bibleLangVisibility) {
      setLangVisibility((prev) => ({ ...prev, ...data.data.bibleLangVisibility }))
    }
    if (data?.data?.navVisibility) {
      setCommunityVisible(data.data.navVisibility.community !== false)
    }
  }

  async function saveConfig() {
    setSavingConfig(true)
    await Promise.all([
      fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'bible_lang_visibility', value: langVisibility }),
      }),
      fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nav_visibility', value: { community: communityVisible } }),
      }),
    ])
    setSavingConfig(false)
  }

  async function saveLiturgy() {
    if (!editLiturgy) return
    setSavingLiturgy(true)
    await fetch(`/api/admin/liturgy/${editLiturgy.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: liturgyEditContent }),
    })
    setSavingLiturgy(false)
    setEditLiturgy(null)
    fetchLiturgy()
  }

  async function saveEditPost() {
    if (!editPost) return
    setSavingPost(true)
    await fetch(`/api/community/posts/${editPost.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSavingPost(false)
    setEditPost(null)
    fetchPosts()
  }

  if (status === 'loading') return (
    <MobileLayout>
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: tc.primary + '33', borderTopColor: tc.primary }} />
      </div>
    </MobileLayout>
  )
  if (!session || session.user.role !== 'admin') return null

  return (
    <MobileLayout>
      <div className="pb-6">
        <div className="px-4 pt-5 pb-3 flex items-center gap-3 border-b border-stone-100">
          <button onClick={() => router.push('/profile')} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-bold text-stone-800">관리자 페이지</h1>
          {(stats?.pendingRequests ?? 0) > 0 && (
            <span className="ml-auto text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{stats!.pendingRequests}건 대기</span>
          )}
        </div>

        {/* 탭 */}
        <div className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide">
          {(['stats', 'users', 'posts', 'requests', 'liturgy', 'config'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`shrink-0 flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${tab === t ? 'text-white' : 'bg-stone-100 text-stone-500'}`}
              style={tab === t ? { backgroundColor: tc.primary } : undefined}>
              {t === 'stats' ? '통계' : t === 'users' ? '회원' : t === 'posts' ? '게시판' : t === 'requests' ? '수정요청' : t === 'liturgy' ? '기도문' : '설정'}
            </button>
          ))}
        </div>

        {/* 통계 탭 */}
        {tab === 'stats' && stats && (
          <div className="px-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="전체 회원" value={stats.totalUsers} icon="👥" tc={tc} />
              <StatCard label="오늘 접속" value={stats.todayLogins} icon="📱" tc={tc} />
              <StatCard label="이번 달 접속" value={stats.monthLogins} icon="📅" tc={tc} />
              <StatCard label="읽기 진행 기록" value={stats.totalProgress} icon="📖" tc={tc} />
              <StatCard label="게시글" value={stats.totalPosts} icon="💬" tc={tc} />
              <StatCard label="대기 중 요청" value={stats.pendingRequests} icon="⏳" tc={tc} accent={stats.pendingRequests > 0} />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">최근 가입 회원</p>
              <div className="space-y-3">
                {stats.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{u.name ?? '이름없음'}</p>
                      <p className="text-xs text-stone-400">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold" style={{ color: tc.primary }}>로그인 {u._count.activityLogs}회</p>
                      <p className="text-[10px] text-stone-400">{new Date(u.createdAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 회원 관리 탭 */}
        {tab === 'users' && (
          <div className="px-4 space-y-3">
            {/* 검색 타입 선택 */}
            <div className="flex gap-1">
              {([['all', '전체'], ['name', '이름'], ['email', '이메일'], ['date', '가입일']] as const).map(([type, label]) => (
                <button key={type} onClick={() => setUserSearchType(type)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                  style={userSearchType === type ? { backgroundColor: tc.primary, color: '#fff' } : { backgroundColor: '#f5f5f4', color: '#78716c' }}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={userSearchType === 'date' ? 'YYYY-MM-DD' : userSearchType === 'email' ? '이메일 검색...' : userSearchType === 'name' ? '이름 검색...' : '이름 또는 이메일...'}
                type={userSearchType === 'date' ? 'date' : 'text'}
                className="flex-1 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)} />
              <button onClick={() => fetchUsers(1)}
                className="px-4 py-2.5 text-white text-xs font-bold rounded-xl"
                style={{ backgroundColor: tc.primary }}>검색</button>
            </div>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${u.status === 'suspended' ? 'border-red-200 bg-red-50/30' : 'border-stone-100'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-stone-800">{u.name ?? '이름없음'}</p>
                        {u.role === 'admin' && <span className="text-[10px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded">관리자</span>}
                        {u.status === 'suspended' && <span className="text-[10px] bg-orange-50 text-orange-500 font-bold px-1.5 py-0.5 rounded">정지됨</span>}
                      </div>
                      <p className="text-xs text-stone-400">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold" style={{ color: tc.primary }}>{u._count.readingProgress}장 읽음</p>
                      <p className="text-[10px] text-stone-400">로그인 {u._count.activityLogs}회</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-stone-400">
                    {u.church && <span>⛪ {u.church}</span>}
                    {u.region && <span>📍 {u.region}</span>}
                    <span>가입 {new Date(u.createdAt).toLocaleDateString('ko-KR')}</span>
                    {u.activityLogs[0] && <span>최근접속 {new Date(u.activityLogs[0].createdAt).toLocaleDateString('ko-KR')}</span>}
                  </div>
                  {u.role !== 'admin' && (
                    <div className="flex gap-1.5 mt-3">
                      <button
                        onClick={() => suspendUser(u.id, u.status)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${u.status === 'suspended' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                        {u.status === 'suspended' ? '정지 해제' : '정지'}
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-500">
                        탈퇴 처리
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && <div className="text-center py-10 text-stone-400 text-sm">회원이 없습니다</div>}
            </div>
            {/* 페이징 */}
            {userTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-2">
                <button disabled={userPage <= 1}
                  onClick={() => fetchUsers(userPage - 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold disabled:opacity-30"
                  style={{ backgroundColor: tc.light, color: tc.primary }}>‹</button>
                {Array.from({ length: Math.min(userTotalPages, 5) }, (_, i) => {
                  const start = Math.max(1, userPage - 2)
                  const p = start + i
                  if (p > userTotalPages) return null
                  return (
                    <button key={p} onClick={() => fetchUsers(p)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors"
                      style={p === userPage ? { backgroundColor: tc.primary, color: '#fff' } : { backgroundColor: tc.light, color: tc.primary }}>
                      {p}
                    </button>
                  )
                })}
                <button disabled={userPage >= userTotalPages}
                  onClick={() => fetchUsers(userPage + 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold disabled:opacity-30"
                  style={{ backgroundColor: tc.light, color: tc.primary }}>›</button>
              </div>
            )}
          </div>
        )}

        {/* 게시판 관리 탭 */}
        {tab === 'posts' && (
          <div className="px-4 space-y-3">
            {/* 카테고리 필터 */}
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((c) => (
                <button key={c.value} onClick={() => { setPostCategory(c.value); setTimeout(fetchPosts, 0) }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${postCategory !== c.value ? 'bg-stone-100 text-stone-500' : 'text-white'}`}
                  style={postCategory === c.value ? { backgroundColor: tc.primary } : undefined}>
                  {c.label}
                </button>
              ))}
            </div>
            {/* 검색 */}
            <div className="flex gap-2">
              <input value={postSearch} onChange={(e) => setPostSearch(e.target.value)}
                placeholder="제목/내용/작성자 검색..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()} />
              <button onClick={fetchPosts}
                className="px-4 py-2.5 text-white text-xs font-bold rounded-xl"
                style={{ backgroundColor: tc.primary }}>검색</button>
            </div>
            {/* 목록 */}
            <div className="space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {post.isPinned && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">공지</span>}
                        <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">
                          {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-stone-800 truncate">{post.title}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{post.user.name ?? '익명'} · {post.user.email}</p>
                      <div className="flex gap-2 mt-1 text-[10px] text-stone-400">
                        <span>💬 {post._count.comments}</span>
                        <span>👁 {post.viewCount}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                  {/* 액션 버튼 */}
                  <div className="flex gap-1.5 mt-3">
                    <button onClick={() => { setEditPost(post); setEditForm({ title: post.title, content: post.content, category: post.category }) }}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold"
                      style={{ backgroundColor: tc.light, color: tc.primary }}>수정</button>
                    <button onClick={() => togglePin(post)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${post.isPinned ? 'bg-amber-50 text-amber-600' : 'bg-stone-50 text-stone-500'}`}>
                      {post.isPinned ? '공지 해제' : '공지 설정'}
                    </button>
                    <button onClick={() => deletePost(post.id)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-500">삭제</button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && <div className="text-center py-10 text-stone-400 text-sm">게시글이 없습니다</div>}
            </div>
          </div>
        )}

        {/* 수정 요청 탭 */}
        {tab === 'requests' && (
          <div className="px-4 space-y-3">
            <div className="flex gap-1">
              {['pending', 'approved', 'rejected', 'all'].map((s) => (
                <button key={s} onClick={() => setRequestStatus(s)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${requestStatus === s ? 'text-white' : 'bg-stone-100 text-stone-500'}`}
                  style={requestStatus === s ? { backgroundColor: tc.primary } : undefined}>
                  {s === 'pending' ? '대기' : s === 'approved' ? '승인' : s === 'rejected' ? '거부' : '전체'}
                </button>
              ))}
            </div>
            {requests.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-sm">요청이 없습니다</div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-stone-800">{r.user.name ?? '이름없음'}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'approved' ? 'bg-green-50 text-green-600' :
                        r.status === 'rejected' ? 'bg-red-50 text-red-500' :
                        r.status === 'restored' ? 'bg-stone-100 text-stone-500' : 'bg-amber-50 text-amber-600'
                      }`}>{r.status === 'approved' ? '승인' : r.status === 'rejected' ? '거부' : r.status === 'restored' ? '복원됨' : '대기'}</span>
                    </div>
                    <p className="text-xs text-stone-500">{r.user.email}</p>
                    <div className="mt-2 bg-stone-50 rounded-xl p-3 text-xs text-stone-600 space-y-1.5">
                      {/* 구절 수정 요청인 경우 구절 위치 표시 */}
                      {r.type === 'verse' && r.verseInfo && (
                        <p className="font-bold text-stone-700">
                          📖 {r.verseInfo.nameKo} {r.verseInfo.chapter}:{r.verseInfo.verse}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">수정 항목: </span>
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                          r.field === 'textEn' ? 'bg-blue-50 text-blue-700' :
                          r.field === 'textKo' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {FIELD_LABELS[r.field] ?? r.field}
                        </span>
                      </p>
                      <div>
                        <p className="font-semibold mb-0.5">현재 내용:</p>
                        <p className="bg-white rounded-lg p-2 text-stone-500 leading-relaxed whitespace-pre-wrap border border-stone-100">{r.currentValue || '(없음)'}</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-0.5">수정 요청 내용:</p>
                        <p className="bg-white rounded-lg p-2 text-stone-800 leading-relaxed whitespace-pre-wrap border border-stone-200 font-medium">{r.requestedValue}</p>
                      </div>
                      {r.reason && <p><span className="font-semibold">사유:</span> {r.reason}</p>}
                    </div>
                    {r.status === 'approved' && r.currentValue && (
                      <div className="mt-3">
                        <button onClick={() => restoreRequest(r.id)}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-stone-100 text-stone-600">
                          ↩ 원본 복원 ({r.currentValue.slice(0, 20)}{r.currentValue.length > 20 ? '...' : ''})
                        </button>
                      </div>
                    )}
                    {r.status === 'pending' && (
                      <div className="mt-3 space-y-2">
                        <input placeholder="관리자 메모" value={adminNote[r.id] ?? ''}
                          onChange={(e) => setAdminNote((m) => ({ ...m, [r.id]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none" />
                        <div className="flex gap-2">
                          <button onClick={() => reviewRequest(r.id, 'approved')}
                            className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-xl">승인</button>
                          <button onClick={() => reviewRequest(r.id, 'rejected')}
                            className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-xl">거부</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 기도문 관리 탭 */}
        {tab === 'liturgy' && (
          <div className="px-4 space-y-3">
            {/* 사도신경 / 주기도문 전환 */}
            <div className="flex gap-1.5">
              {(['creed', 'prayer'] as const).map((t) => (
                <button key={t} onClick={() => setLiturgyTab(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${liturgyTab !== t ? 'bg-stone-100 text-stone-500' : 'text-white'}`}
                  style={liturgyTab === t ? { backgroundColor: tc.primary } : undefined}>
                  {t === 'creed' ? '사도신경' : '주기도문'}
                </button>
              ))}
            </div>

            {(liturgyTab === 'creed' ? liturgyTexts.creed : liturgyTexts.prayer).map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-800">{item.version}</span>
                    {item.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tc.primary }}>기본</span>
                    )}
                  </div>
                  <button
                    onClick={() => { setEditLiturgy(item); setLiturgyEditContent(item.content) }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: tc.light, color: tc.primary }}>
                    수정
                  </button>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed line-clamp-4 whitespace-pre-line">{item.content}</p>
              </div>
            ))}

            {(liturgyTab === 'creed' ? liturgyTexts.creed : liturgyTexts.prayer).length === 0 && (
              <div className="text-center py-10 text-stone-400 text-sm">기도문이 없습니다</div>
            )}
          </div>
        )}

        {/* 설정 탭 */}
        {tab === 'config' && (
          <div className="px-4 space-y-4">
            {/* 번역본 표시 설정 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">성경 번역본 표시 설정</p>
              <div className="space-y-3">
                {(['ko', 'en', 'narrative', 'easy'] as const).map((lang) => {
                  const isOn = langVisibility[lang]
                  const isRequired = lang === 'ko'
                  return (
                    <div key={lang} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">{LANG_LABELS[lang]}</p>
                        {isRequired && <p className="text-[10px] text-stone-400 mt-0.5">기본 번역본 — 항상 표시됩니다</p>}
                        {lang === 'narrative' && <p className="text-[10px] text-stone-400 mt-0.5">창세기만 지원</p>}
                        {lang === 'easy' && <p className="text-[10px] text-stone-400 mt-0.5">창세기만 지원</p>}
                      </div>
                      <button
                        disabled={isRequired}
                        onClick={() => !isRequired && setLangVisibility((v) => ({ ...v, [lang]: !v[lang] }))}
                        className="w-12 h-6 rounded-full transition-colors flex items-center disabled:opacity-40"
                        style={{ backgroundColor: isOn ? tc.primary : '#e7e5e4' }}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* 하단 네비 표시 설정 */}
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-5 mb-3">하단 네비 메뉴</p>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-semibold text-stone-800">게시판</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">하단 네비에서 게시판 메뉴 표시 여부</p>
                </div>
                <button
                  onClick={() => setCommunityVisible((v) => !v)}
                  className="w-12 h-6 rounded-full transition-colors flex items-center"
                  style={{ backgroundColor: communityVisible ? tc.primary : '#e7e5e4' }}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${communityVisible ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <button
                onClick={saveConfig}
                disabled={savingConfig}
                className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: tc.primary }}
              >
                {savingConfig ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 기도문 편집 모달 */}
      {editLiturgy && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col bg-stone-50">
          <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-stone-100 shrink-0">
            <button onClick={() => setEditLiturgy(null)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-stone-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex-1">
              <h2 className="text-base font-bold text-stone-800">
                {editLiturgy.type === 'creed' ? '사도신경' : '주기도문'} — {editLiturgy.version}
              </h2>
            </div>
            <button onClick={saveLiturgy} disabled={savingLiturgy}
              className="px-4 py-1.5 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
              style={{ backgroundColor: tc.primary }}>
              {savingLiturgy ? '저장 중...' : '저장'}
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            <textarea
              value={liturgyEditContent}
              onChange={(e) => setLiturgyEditContent(e.target.value)}
              rows={24}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 text-sm focus:outline-none resize-none leading-relaxed font-noto-serif-kr"
            />
            <p className="text-xs text-stone-400 mt-2 px-1">줄바꿈은 그대로 표시됩니다.</p>
          </div>
        </div>
      )}

      {/* 게시글 수정 모달 */}
      {editPost && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col bg-stone-50">
          <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-stone-100 shrink-0">
            <button onClick={() => setEditPost(null)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-stone-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="flex-1 text-base font-bold text-stone-800">게시글 수정</h2>
            <button onClick={saveEditPost} disabled={savingPost}
              className="px-4 py-1.5 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
              style={{ backgroundColor: tc.primary }}>
              {savingPost ? '저장 중...' : '저장'}
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-400 mb-1.5 block">카테고리</label>
              <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-sm text-stone-700 focus:outline-none">
                {CATEGORIES.filter((c) => c.value !== 'all').map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-400 mb-1.5 block">제목</label>
              <input type="text" value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-400 mb-1.5 block">내용</label>
              <textarea value={editForm.content}
                onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                rows={14}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 text-sm focus:outline-none resize-none" />
            </div>
            <div className="text-xs text-stone-400">
              작성자: {editPost.user.name ?? '익명'} ({editPost.user.email})
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}

function StatCard({ label, value, icon, tc, accent }: { label: string; value: number; icon: string; tc: { primary: string; light: string }; accent?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border ${accent ? 'border-red-200' : 'border-stone-100'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className={`text-xl font-bold ${accent ? 'text-red-500' : ''}`}
          style={!accent ? { color: tc.primary } : undefined}>
          {value.toLocaleString()}
        </p>
      </div>
      <p className="text-[10px] text-stone-400">{label}</p>
    </div>
  )
}

const FIELD_LABELS: Record<string, string> = {
  name: '이름', phone: '연락처', church: '교회', region: '지역', bio: '소개',
  textKo: '한국어 성경본문', textEn: '영어 성경본문(KJV)',
}
