'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BOOKS } from '@/domain/value-objects/BookName'

interface BookSelectorProps {
  currentBookId: number
  currentChapter: number
  onClose: () => void
  initialMode?: 'book' | 'chapter'
}

// 장 수가 많은 책은 파트로 나눠서 표시 (가독성)
function getChapterParts(total: number): number[][] {
  if (total <= 30) return [Array.from({ length: total }, (_, i) => i + 1)]
  const size = total <= 60 ? 10 : total <= 100 ? 20 : 30
  const parts: number[][] = []
  for (let i = 0; i < total; i += size) {
    parts.push(Array.from({ length: Math.min(size, total - i) }, (_, j) => i + j + 1))
  }
  return parts
}

export function BookSelector({ currentBookId, currentChapter, onClose, initialMode = 'book' }: BookSelectorProps) {
  const router = useRouter()
  const [selectedBookId, setSelectedBookId] = useState<number | null>(
    initialMode === 'chapter' ? currentBookId : null
  )

  const selectedBook = selectedBookId != null ? BOOKS.find((b) => b.id === selectedBookId) ?? null : null
  const oldBooks = BOOKS.filter((b) => b.testament === 'old')
  const newBooks = BOOKS.filter((b) => b.testament === 'new')

  const handleChapterSelect = (chapter: number) => {
    router.push(`/bible/${selectedBookId}/${chapter}`)
    onClose()
  }

  const chapterParts = selectedBook ? getChapterParts(selectedBook.totalChapters) : []

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: '88vh' }}>
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {!selectedBook ? (
          /* ── 책 목록 ── */
          <>
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <h2 className="text-base font-bold text-stone-800">성경 선택</h2>
              <button onClick={onClose} className="text-stone-400 p-1">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 pb-8">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 mt-1">구약 — 39권</p>
              <div className="grid grid-cols-4 gap-1.5 mb-5">
                {oldBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`py-2.5 px-1 rounded-xl text-xs font-medium text-center leading-tight transition-colors ${
                      book.id === currentBookId
                        ? 'bg-indigo-600 text-white'
                        : 'bg-stone-100 text-stone-700 active:bg-stone-200'
                    }`}
                  >
                    {book.nameKo}
                  </button>
                ))}
              </div>

              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">신약 — 27권</p>
              <div className="grid grid-cols-4 gap-1.5">
                {newBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`py-2.5 px-1 rounded-xl text-xs font-medium text-center leading-tight transition-colors ${
                      book.id === currentBookId
                        ? 'bg-indigo-600 text-white'
                        : 'bg-stone-100 text-stone-700 active:bg-stone-200'
                    }`}
                  >
                    {book.nameKo}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ── 장 선택 ── */
          <>
            <div className="flex items-center gap-3 px-5 py-3 shrink-0 border-b border-stone-100">
              <button
                onClick={() => initialMode === 'chapter' ? onClose() : setSelectedBookId(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold text-stone-800">{selectedBook.nameKo}</h2>
              <span className="ml-auto text-sm font-semibold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                총 {selectedBook.totalChapters}장
              </span>
            </div>

            <div className="overflow-y-auto px-4 pb-8">
              {chapterParts.map((part, partIdx) => (
                <div key={partIdx} className="mt-4">
                  {/* 파트가 여러 개일 때만 구간 레이블 표시 */}
                  {chapterParts.length > 1 && (
                    <p className="text-xs font-bold text-stone-400 mb-2">
                      {part[0]}장 — {part[part.length - 1]}장
                    </p>
                  )}
                  <div className="grid grid-cols-6 gap-2">
                    {part.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => handleChapterSelect(ch)}
                        className={`h-12 rounded-xl text-sm font-bold transition-colors ${
                          selectedBook.id === currentBookId && ch === currentChapter
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-700 active:bg-indigo-100 active:text-indigo-700'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
