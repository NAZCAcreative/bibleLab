'use client'
// Design Ref: §5.7 — QT 묵상 노트 에디터 (날짜별 저장)
import { useState, useEffect } from 'react'
import { useQT } from '@/presentation/hooks/useQT'

interface QTEditorProps {
  date: string    // YYYY-MM-DD
  onSaved?: () => void
}

export function QTEditor({ date, onSaved }: QTEditorProps) {
  const { note, isLoading, isSaving, save, remove } = useQT(date)
  const [content, setContent] = useState('')
  const [verseRef, setVerseRef] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  // 노트 로드 시 에디터에 반영
  useEffect(() => {
    if (note) {
      setContent(note.content)
      setVerseRef(note.verseRef ?? '')
    } else {
      setContent('')
      setVerseRef('')
    }
    setIsDirty(false)
  }, [note])

  const handleSave = async () => {
    if (!content.trim()) return
    await save(content, verseRef || undefined)
    setIsDirty(false)
    onSaved?.()
  }

  const handleDelete = async () => {
    await remove()
    setContent('')
    setVerseRef('')
    setIsDirty(false)
  }

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{displayDate}</h2>
          {note && (
            <p className="text-xs text-gray-400 mt-0.5">마지막 수정: {formatTime(note.updatedAt)}</p>
          )}
        </div>
        {note && (
          <button
            onClick={handleDelete}
            className="text-xs text-red-400 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
          불러오는 중...
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* 관련 구절 입력 */}
          <input
            type="text"
            value={verseRef}
            onChange={(e) => { setVerseRef(e.target.value); setIsDirty(true) }}
            placeholder="관련 구절 (예: 요 3:16)"
            className="w-full text-sm text-blue-600 placeholder-gray-300 border-0 border-b border-gray-100 pb-2 focus:outline-none focus:border-blue-300 transition-colors bg-transparent"
          />

          {/* 묵상 내용 */}
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setIsDirty(true) }}
            placeholder="오늘의 말씀에서 받은 은혜를 기록하세요..."
            rows={8}
            className="w-full text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none leading-relaxed"
          />

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim() || !isDirty}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDirty && content.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? '저장 중...' : note ? '수정 저장' : '저장'}
          </button>
        </div>
      )}
    </div>
  )
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  })
}
