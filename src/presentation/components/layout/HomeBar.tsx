'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useBibleStore } from '@/store/bibleStore'

// 성경 페이지 외에서 상단에 표시되는 "이어읽기" 홈버튼 바
export function HomeBar() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const currentBookId = useBibleStore((s) => s.currentBookId)
  const currentChapter = useBibleStore((s) => s.currentChapter)

  useEffect(() => { setMounted(true) }, [])

  // 마운트 전 또는 성경 페이지에서는 숨김
  if (!mounted || pathname.startsWith('/bible')) return null

  return (
    <div className="sticky top-0 z-40 bg-indigo-600 px-4 py-2.5 flex items-center justify-end">
      <button
        onClick={() => router.push(`/bible/${currentBookId}/${currentChapter}`)}
        className="flex items-center gap-2 bg-white/20 active:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
      >
        <HomeIcon className="w-4 h-4 text-white" />
        <span className="text-white text-xs font-bold">통독모드로 돌아가기</span>
      </button>
    </div>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}
