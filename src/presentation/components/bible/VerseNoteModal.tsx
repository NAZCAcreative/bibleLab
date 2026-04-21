'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { NOTE_COLORS, getNoteColor, type NoteColor } from '@/lib/noteColors'
import { useBibleStore, THEMES } from '@/store/bibleStore'

interface VerseNoteModalProps {
  verseId: string
  verseRef: string
  verseText: string
  correctionField?: 'textKo' | 'textEn'
  initialMemo?: { content: string; color: NoteColor }
  onClose: () => void
  onNoteSaved?: (verseId: string, color: string, content?: string) => void
}

type Tab = 'note' | 'correction'
type NoteMode = 'view' | 'write'

export function VerseNoteModal({ verseId, verseRef, verseText, correctionField = 'textKo', initialMemo, onClose, onNoteSaved }: VerseNoteModalProps) {
  const { status } = useSession()
  const [tab, setTab] = useState<Tab>('note')

  const [existingMemo, setExistingMemo] = useState<{ content: string; color: NoteColor } | null>(null)
  const [noteLoading, setNoteLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [noteColor, setNoteColor] = useState<NoteColor>('yellow')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteMode, setNoteMode] = useState<NoteMode>(initialMemo?.content ? 'view' : 'write')
  const [colorSaving, setColorSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [correctionText, setCorrectionText] = useState(verseText)
  const [correctionReason, setCorrectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [correctionDone, setCorrectionDone] = useState(false)
  const [correctionError, setCorrectionError] = useState('')

  useEffect(() => {
    if (initialMemo?.content) {
      setExistingMemo(initialMemo)
      setNoteColor(initialMemo.color)
      setNoteLoading(false)
      return
    }
    if (status !== 'authenticated') { setNoteLoading(false); return }
    fetch(`/api/memos/${verseId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.content) {
          const color = (d.data.color ?? 'yellow') as NoteColor
          setExistingMemo({ content: d.data.content, color })
          setNoteColor(color)
          setNoteMode('view')
        }
      })
      .catch(() => {})
      .finally(() => setNoteLoading(false))
  }, [verseId, status])

  useEffect(() => {
    if (noteMode === 'write' && !noteLoading) {
      setTimeout(() => textareaRef.current?.focus(), 80)
    }
  }, [noteMode, noteLoading])

  // 색상 클릭 → 구절 색 실시간 변경 + 기존 노트 있으면 API 저장
  const handleColorChange = async (color: NoteColor) => {
    setNoteColor(color)
    // 실시간으로 뒤 구절 색 변경
    onNoteSaved?.(verseId, color)

    if (existingMemo && noteMode === 'view') {
      setColorSaving(true)
      setExistingMemo((prev) => prev ? { ...prev, color } : prev)
      await fetch(`/api/memos/${verseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: existingMemo.content, color }),
      }).catch(() => {})
      setColorSaving(false)
    }
  }

  const startWrite = () => {
    if (existingMemo) { setNoteText(existingMemo.content); setNoteColor(existingMemo.color) }
    else setNoteText('')
    setNoteMode('write')
  }

  const cancelWrite = () => {
    setNoteText('')
    // 취소 시 원래 색으로 복원
    const revertColor = existingMemo?.color ?? null
    if (revertColor) { setNoteColor(revertColor); onNoteSaved?.(verseId, revertColor) }
    else onNoteSaved?.(verseId, '')
    setNoteMode('view')
  }

  const saveNote = async () => {
    if (!noteText.trim()) return
    setNoteSaving(true)
    await fetch(`/api/memos/${verseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: noteText.trim(), color: noteColor }),
    }).catch(() => {})
    const saved = { content: noteText.trim(), color: noteColor }
    setExistingMemo(saved)
    setNoteText('')
    setNoteMode('view')
    setNoteSaving(false)
    onNoteSaved?.(verseId, noteColor, noteText.trim())
  }

  const deleteNote = async () => {
    await fetch(`/api/memos/${verseId}`, { method: 'DELETE' }).catch(() => {})
    setExistingMemo(null)
    setNoteColor('yellow')
    setNoteMode('view')
    onNoteSaved?.(verseId, '')
  }

  const submitCorrection = async () => {
    if (correctionText.trim() === verseText.trim()) { setCorrectionError('변경 내용이 없습니다.'); return }
    setSubmitting(true); setCorrectionError('')
    const res = await fetch('/api/verse-corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verseId, field: correctionField, requestedValue: correctionText.trim(), reason: correctionReason.trim() || null }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setCorrectionError(data.error ?? '오류 발생'); return }
    setCorrectionDone(true)
  }

  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]
  const currentColorObj = getNoteColor(noteColor)
  const hasNote = !!existingMemo

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pb-20">
      <div className="flex-1" onClick={onClose} />

      <div className="bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '80vh' }}>
        {/* 핸들 */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* 구절 참조 + 탭 */}
        <div className="px-4 pb-2 shrink-0">
          <p className="text-sm font-bold mb-2" style={{ color: tc.primary }}>{verseRef}</p>
          <div className="flex gap-1">
            <button onClick={() => setTab('note')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${tab !== 'note' ? 'bg-stone-100 text-stone-500' : 'text-white'}`}
              style={tab === 'note' ? { backgroundColor: tc.primary } : undefined}>
              📝 노트
            </button>
            <button onClick={() => setTab('correction')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${tab === 'correction' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
              ✏️ 성경구절 수정요청
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── 노트 탭 ── */}
          {tab === 'note' && (
            <>
              {noteLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : noteMode === 'view' ? (
                <>
                  {/* ── 노트 없음: 색상 큰 피커 ── */}
                  {!hasNote && (
                    <div className="px-4 pt-2 pb-4">
                      <p className="text-[11px] font-bold text-stone-400 mb-3 text-center">구절에 표시할 색을 선택하세요</p>
                      <div className="flex gap-2.5 overflow-x-auto py-2 px-1">
                        {NOTE_COLORS.map((c) => (
                          <button
                            key={c.key}
                            onClick={() => handleColorChange(c.key as NoteColor)}
                            className="shrink-0 w-9 h-9 rounded-full active:scale-90 transition-transform"
                            style={{
                              backgroundColor: c.bg,
                              outline: noteColor === c.key ? `2.5px solid ${c.dark}` : '2px solid transparent',
                              outlineOffset: '2px',
                              transform: noteColor === c.key ? 'scale(1.15)' : undefined,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── 노트 있음: 작은 색상 피커 + 쪽지 ── */}
                  {hasNote && existingMemo && (
                    <div className="px-4 pt-1 pb-3 space-y-3">
                      {/* 작은 색상 피커 */}
                      <div className="flex items-center justify-center flex-wrap gap-2.5 py-2 px-1">
                        {colorSaving && <span className="text-[10px] text-stone-400 shrink-0">저장 중...</span>}
                        {NOTE_COLORS.map((c) => (
                          <button
                            key={c.key}
                            onClick={() => handleColorChange(c.key as NoteColor)}
                            className="shrink-0 w-8 h-8 rounded-full transition-transform active:scale-90"
                            style={{
                              backgroundColor: c.bg,
                              outline: noteColor === c.key ? `2.5px solid ${c.dark}` : 'none',
                              outlineOffset: '2px',
                              transform: noteColor === c.key ? 'scale(1.15)' : undefined,
                            }}
                            aria-label={c.key}
                          />
                        ))}
                      </div>

                      {/* 쪽지 스타일 노트 */}
                      <div
                        className="rounded-2xl overflow-hidden shadow-lg"
                        style={{ backgroundColor: getNoteColor(existingMemo.color).bg }}
                      >
                        {/* 쪽지 헤더 */}
                        <div
                          className="px-4 py-2 flex items-center justify-between"
                          style={{ backgroundColor: getNoteColor(existingMemo.color).dark + '22' }}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNoteColor(existingMemo.color).dark }} />
                            <span className="text-xs font-bold" style={{ color: getNoteColor(existingMemo.color).dark }}>내 노트</span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-medium">{verseRef}</span>
                        </div>

                        {/* 쪽지 내용 */}
                        <div className="px-4 pt-3 pb-4">
                          <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                            {existingMemo.content}
                          </p>
                        </div>

                        {/* 쪽지 하단 수정/삭제 */}
                        <div
                          className="px-3 py-2 flex gap-2 border-t"
                          style={{ borderColor: getNoteColor(existingMemo.color).dark + '30' }}
                        >
                          <button
                            onClick={deleteNote}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-stone-500 bg-white/60 active:bg-red-50 active:text-red-500 transition-colors"
                          >
                            삭제
                          </button>
                          <button
                            onClick={startWrite}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                            style={{ backgroundColor: getNoteColor(existingMemo.color).dark }}
                          >
                            수정
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ── 쓰기 모드 ── */
                <div className="px-4 pt-1 pb-3 space-y-3">
                  {/* 작은 색상 피커 */}
                  <div className="flex items-center justify-center flex-wrap gap-2.5 py-2 px-1">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c.key}
                        onClick={() => handleColorChange(c.key as NoteColor)}
                        className="shrink-0 w-8 h-8 rounded-full transition-transform active:scale-90"
                        style={{
                          backgroundColor: c.bg,
                          outline: noteColor === c.key ? `2.5px solid ${c.dark}` : 'none',
                          outlineOffset: '2px',
                          transform: noteColor === c.key ? 'scale(1.15)' : undefined,
                        }}
                        aria-label={c.key}
                      />
                    ))}
                  </div>

                  {/* 입력창 */}
                  <textarea
                    ref={textareaRef}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="노트하세요."
                    rows={6}
                    style={{ backgroundColor: currentColorObj.bg }}
                    className="w-full px-4 py-3 rounded-2xl text-sm text-stone-800 resize-none focus:outline-none shadow-sm placeholder-stone-400 leading-relaxed"
                  />
                </div>
              )}
            </>
          )}

          {/* ── 수정요청 탭 ── */}
          {tab === 'correction' && (
            <div className="px-4 py-3 space-y-3">
              {correctionDone ? (
                <div className="text-center py-8">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-sm font-semibold text-stone-700">수정 요청이 제출되었습니다</p>
                  <p className="text-xs text-stone-400 mt-1">관리자 검토 후 반영됩니다</p>
                  <button onClick={onClose} className="mt-4 px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">닫기</button>
                </div>
              ) : (
                <>
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-stone-400 mb-1">현재 본문</p>
                    <p className="text-xs text-stone-600 leading-relaxed">{verseText}</p>
                  </div>
                  <textarea value={correctionText} onChange={(e) => setCorrectionText(e.target.value)}
                    placeholder="수정 내용을 입력하세요..." rows={4}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  <input value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="수정 사유"
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  {correctionError && <p className="text-red-500 text-xs">{correctionError}</p>}
                </>
              )}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-4 py-3 border-t border-stone-100 bg-white shrink-0">
          {tab === 'note' && !noteLoading && (
            <>
              {noteMode === 'write' && (
                <div className="flex gap-2">
                  <button onClick={cancelWrite}
                    className="flex-1 py-3 bg-stone-100 text-stone-600 text-sm font-bold rounded-xl active:bg-stone-200">
                    취소
                  </button>
                  <button onClick={saveNote} disabled={noteSaving || !noteText.trim()}
                    style={{ backgroundColor: noteText.trim() ? currentColorObj.dark : undefined }}
                    className="flex-1 py-3 text-white text-sm font-bold rounded-xl disabled:opacity-40 disabled:bg-stone-300 transition-colors">
                    {noteSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              )}
            </>
          )}
          {tab === 'correction' && !correctionDone && (
            <button onClick={submitCorrection} disabled={submitting}
              className="w-full py-3 bg-amber-500 text-white text-sm font-bold rounded-xl disabled:opacity-40">
              {submitting ? '제출 중...' : '수정 요청 제출'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const COLOR_LABELS: Record<string, string> = {
  yellow: '노랑', lime: '라임', green: '초록', teal: '청록',
  sky: '하늘', blue: '파랑', violet: '바이올렛', purple: '보라',
  pink: '핑크', rose: '로즈', orange: '주황', stone: '그레이',
}
