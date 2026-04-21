'use client'
import { useRouter } from 'next/navigation'
import { getBookById } from '@/domain/value-objects/BookName'
import { useBibleStore, THEMES } from '@/store/bibleStore'

interface ChapterNavigatorProps {
  bookId: number
  chapter: number
  totalChapters: number
}

export function ChapterNavigator({ bookId, chapter, totalChapters }: ChapterNavigatorProps) {
  const router = useRouter()
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]

  const goPrev = () => {
    if (chapter > 1) {
      router.push(`/bible/${bookId}/${chapter - 1}`)
    } else if (bookId > 1) {
      const prevBook = getBookById(bookId - 1)
      if (prevBook) router.push(`/bible/${bookId - 1}/${prevBook.totalChapters}`)
    }
  }

  const goNext = () => {
    if (chapter < totalChapters) {
      router.push(`/bible/${bookId}/${chapter + 1}`)
    } else if (bookId < 66) {
      router.push(`/bible/${bookId + 1}/1`)
    }
  }

  const hasPrev = chapter > 1 || bookId > 1
  const hasNext = chapter < totalChapters || bookId < 66

  return (
    <div className="sticky bottom-20 z-20 flex items-center justify-between gap-3 px-4 py-3 border-t border-stone-100 bg-white">
      <button
        onClick={goPrev}
        disabled={!hasPrev}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm transition-all ${
          hasPrev
            ? 'bg-stone-100 text-stone-700 active:bg-stone-200'
            : 'bg-stone-50 text-stone-300 cursor-not-allowed'
        }`}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        이전 장
      </button>

      <span className="text-xs text-stone-400 shrink-0">
        {chapter} / {totalChapters}
      </span>

      <button
        onClick={goNext}
        disabled={!hasNext}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm transition-all ${
          !hasNext ? 'bg-stone-50 text-stone-300 cursor-not-allowed' : 'text-white active:opacity-80'
        }`}
        style={hasNext ? { backgroundColor: tc.primary } : undefined}
      >
        다음 장
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
