'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { MobileLayout } from '@/presentation/components/layout/MobileLayout'
import { useBibleStore, FONT_SIZE_CLASS } from '@/store/bibleStore'

type Comment = { id: string; content: string; createdAt: string; user: { id: string; name: string | null } }
type Post = {
  id: string; title: string; content: string; category: string
  viewCount: number; createdAt: string; isPinned: boolean; showBio: boolean
  user: { id: string; name: string | null; church: string | null; bio: string | null }
  comments: Comment[]
}

export default function PostDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const fontSize = useBibleStore((s) => s.fontSize)
  const fontSizeClass = FONT_SIZE_CLASS[fontSize] ?? 'text-base leading-relaxed'
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/community/posts/${params.id}`)
      .then((r) => r.json())
      .then((data) => { if (data?.data) setPost(data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch(`/api/community/posts/${params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment }),
    })
    const data = await res.json()
    if (res.ok && data?.data) {
      setPost((p) => p ? { ...p, comments: [...p.comments, data.data] } : p)
      setComment('')
    }
    setSubmitting(false)
  }

  async function deletePost() {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`/api/community/posts/${params.id}`, { method: 'DELETE' })
    router.push('/community')
  }

  if (loading) return <MobileLayout><div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" /></div></MobileLayout>
  if (!post) return <MobileLayout><div className="text-center py-20 text-stone-400 text-sm">게시글을 찾을 수 없습니다.</div></MobileLayout>

  const isOwner = session?.user.id === post.user.id || session?.user.role === 'admin'

  return (
    <MobileLayout>
      <div className="pb-20">
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-4 h-14 bg-white border-b border-stone-100 sticky top-16 z-10">
          <button onClick={() => router.push('/community')} className="w-10 h-10 flex items-center justify-center rounded-full text-stone-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="flex-1 text-sm font-bold text-stone-800 truncate">소통 게시판</h1>
          {isOwner && (
            <button onClick={deletePost} className="text-xs text-red-500 font-medium">삭제</button>
          )}
        </div>

        {/* 게시글 본문 */}
        <div className="px-4 py-5 border-b border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
              {post.category === 'prayer' ? '기도제목' : post.category === 'testimony' ? '간증' : post.category === 'question' ? '질문' : '자유'}
            </span>
          </div>
          <h2 className="text-base font-bold text-stone-800 mb-1">{post.title}</h2>
          <div className="flex items-center gap-2 text-[10px] text-stone-400 mb-3">
            <span>{post.user.name ?? '익명'}</span>
            {post.user.church && <span>· {post.user.church}</span>}
            <span>· {new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
            <span>· 조회 {post.viewCount}</span>
          </div>

          {/* 자기소개 표시 */}
          {post.showBio && post.user.bio && (
            <div className="mb-4 px-3 py-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-400 mb-1">작성자 소개</p>
              <p className="text-xs text-indigo-700 leading-relaxed">{post.user.bio}</p>
            </div>
          )}

          <p className={`${fontSizeClass} text-stone-700 whitespace-pre-wrap`}>{post.content}</p>
        </div>

        {/* 댓글 목록 */}
        <div className="px-4 py-3">
          <p className="text-xs font-bold text-stone-400 mb-3">댓글 {post.comments.length}개</p>
          <div className="space-y-3">
            {post.comments.map((c) => (
              <div key={c.id} className="bg-stone-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-stone-700">{c.user.name ?? '익명'}</span>
                  <span className="text-[10px] text-stone-400">{new Date(c.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <p className={`${fontSizeClass} text-stone-600`}>{c.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 댓글 입력 */}
        {session ? (
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-stone-100 px-4 py-3">
            <form onSubmit={submitComment} className="flex gap-2">
              <input value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <button type="submit" disabled={submitting || !comment.trim()}
                className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl disabled:opacity-50">
                등록
              </button>
            </form>
          </div>
        ) : (
          <div className="px-4 py-4 border-t border-stone-100 text-center">
            <a href="/auth/login" className="text-xs text-indigo-600 font-medium">로그인 후 댓글 작성 가능</a>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
