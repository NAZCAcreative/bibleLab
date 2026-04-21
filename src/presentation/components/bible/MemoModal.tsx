'use client'
// Design Ref: §5.4 — 묵상 노트 모달 (날짜별 QT 노트)
import { useState, useEffect } from 'react'

interface MemoModalProps {
  verseRef: string
  date: string        // YYYY-MM-DD
  onClose: () => void
}

export function MemoModal({ verseRef, date, onClose }: MemoModalProps) {
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 기존 노트 로드
  useEffect(() => {
    fetch(`/api/qt/${date}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.content) setContent(json.data.content)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [date])

  const handleSave = async () => {
    if (!content.trim()) return
    setIsSaving(true)
    try {
      await fetch(`/api/qt/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, verseRef }),
      })
      onClose()
    } catch {
      // 오류 무시
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* 백드롭 */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      {/* 모달 */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">묵상 노트</h2>
            <p className="text-xs text-gray-400 mt-0.5">{verseRef} · {date}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <span className="text-gray-400 text-sm">불러오는 중...</span>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘의 묵상을 기록하세요..."
              className="w-full h-40 text-sm text-gray-800 placeholder-gray-300 resize-none border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              autoFocus
            />
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
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
