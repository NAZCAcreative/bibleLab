'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MobileLayout } from '@/presentation/components/layout/MobileLayout'
import { TopBar } from '@/presentation/components/layout/TopBar'
import { ChapterNavigator } from '@/presentation/components/bible/ChapterNavigator'
import { VerseItem } from '@/presentation/components/bible/VerseItem'
import { VerseNoteModal } from '@/presentation/components/bible/VerseNoteModal'
import { LanguageToggle } from '@/presentation/components/bible/LanguageToggle'
import { BookSelector } from '@/presentation/components/bible/BookSelector'
import { ReadingSettings } from '@/presentation/components/bible/ReadingSettings'
import { useChapter } from '@/presentation/hooks/useChapter'
import { useReadingTimer } from '@/presentation/hooks/useReadingTimer'
import { useBibleStore, FONT_SIZE_CLASS, FONT_FAMILY_CLASS, THEMES } from '@/store/bibleStore'
import { getNarrativeVerse } from '@/data/narrativeGenesis'
import { getEasyKoreanVerse } from '@/data/easyKoreanGenesis'

export default function BibleReaderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const bookId = Number(params.bookId)
  const chapter = Number(params.chapter)
  const targetVerse = Number(searchParams.get('verse') ?? '0')
  const { status } = useSession()

  const language = useBibleStore((s) => s.language)
  const fontSize = useBibleStore((s) => s.fontSize)
  const fontFamily = useBibleStore((s) => s.fontFamily)
  const theme = useBibleStore((s) => s.theme)
  const setPosition = useBibleStore((s) => s.setPosition)
  const addToHistory = useBibleStore((s) => s.addToHistory)
  const updateHistoryReadCount = useBibleStore((s) => s.updateHistoryReadCount)
  const tc = THEMES[theme]

  const { data, isLoading, error } = useChapter(bookId, chapter)
  useReadingTimer(bookId, chapter)

  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null)
  const [readVerseIds, setReadVerseIds] = useState<Set<string>>(new Set())
  const [memoColors, setMemoColors] = useState<Record<string, string>>({})
  const [highlightedVerse, setHighlightedVerse] = useState<number>(0)
  const [memoContents, setMemoContents] = useState<Record<string, string>>({})
  const [showBookSelector, setShowBookSelector] = useState(false)
  const [showChapterSelector, setShowChapterSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => { setPosition(bookId, chapter) }, [bookId, chapter, setPosition])

  useEffect(() => {
    if (data?.book.nameKo) {
      addToHistory(bookId, data.book.nameKo, chapter)
    }
  }, [bookId, chapter, data?.book.nameKo])

  useEffect(() => {
    if (!data?.verses) return
    const nums = data.verses.filter((v) => readVerseIds.has(v.id)).map((v) => v.verse)
    const maxVerse = nums.length > 0 ? Math.max(...nums) : 0
    updateHistoryReadCount(bookId, chapter, maxVerse)
  }, [bookId, chapter, readVerseIds, data?.verses, updateHistoryReadCount])

  // 검색에서 특정 절로 이동: 데이터 로드 후 스크롤 + 반짝임
  useEffect(() => {
    if (!data || !targetVerse) return
    const el = document.getElementById(`verse-${targetVerse}`)
    if (!el) return
    // 상단 기준 스크롤 (TopBar 높이 64px 고려)
    const top = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
    setHighlightedVerse(targetVerse)
    const timer = setTimeout(() => setHighlightedVerse(0), 2300)
    return () => clearTimeout(timer)
  }, [data, targetVerse])

  // 챕터 완독은 모든 구절을 읽었을 때만 자동 기록 (verse-reads API에서 처리)

  // 읽은 구절 로드
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch(`/api/verse-reads?bookId=${bookId}&chapter=${chapter}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.data?.readVerseIds)) {
          setReadVerseIds(new Set(d.data.readVerseIds))
        }
      })
      .catch(() => {})
  }, [bookId, chapter, status])

  // 메모 색상 로드
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch(`/api/memos?bookId=${bookId}&chapter=${chapter}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.memoColors) setMemoColors(d.data.memoColors)
        if (d?.data?.memoContents) setMemoContents(d.data.memoContents)
      })
      .catch(() => {})
  }, [bookId, chapter, status])

  // 통독모드: 구절 클릭 → 읽음 토글
  const handleReadToggle = useCallback(async (verseId: string) => {
    if (status !== 'authenticated') { setShowLoginPrompt(true); return }
    setReadVerseIds((prev) => {
      const next = new Set(prev)
      if (next.has(verseId)) next.delete(verseId)
      else next.add(verseId)
      return next
    })
    await fetch('/api/verse-reads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verseId }),
    }).catch(() => {})
  }, [status])

  // 노트모드: 구절 클릭
  const handleNotePress = useCallback((verseId: string) => {
    if (status !== 'authenticated') { setShowLoginPrompt(true); return }
    setSelectedVerseId((prev) => (prev === verseId ? null : verseId))
  }, [status])

  const selectedVerse = data?.verses.find((v) => v.id === selectedVerseId)
  const verseRef = selectedVerse ? `${data?.book.nameKo} ${chapter}:${selectedVerse.verse}` : ''

  const readCount = readVerseIds.size
  const totalVerses = data?.verses.length ?? 0

  return (
    <MobileLayout hideTopBar>
      <TopBar onSettingsOpen={() => setShowSettings(true)} />

      {/* 언어 탭 */}
      <div className="sticky top-16 z-30 bg-white border-b border-stone-200/60">
        <LanguageToggle bookId={bookId} chapter={chapter} />
      </div>

      {/* 책/장 선택 + 진행바 — sticky */}
      <div className="sticky top-[104px] z-20 bg-white border-b border-stone-100 px-3 py-2">
        <div className="flex items-center gap-2">
          {/* 책 선택 */}
          <button
            onClick={() => setShowBookSelector(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl active:opacity-70 shrink-0"
            style={{ backgroundColor: tc.primary + '14' }}
          >
            <span className="text-sm font-bold truncate max-w-[64px]" style={{ color: tc.primary }}>
              {isLoading ? '...' : (error || !data) ? '오류' : data.book.nameKo}
            </span>
            <ChevronDownIcon className="w-4 h-4 shrink-0" style={{ color: tc.primary + '80' }} />
          </button>

          {/* 장 선택 */}
          <button
            onClick={() => setShowChapterSelector(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl active:opacity-70 shrink-0"
            style={{ backgroundColor: tc.primary + '14' }}
          >
            <span className="text-sm font-bold" style={{ color: tc.primary }}>{chapter}장</span>
            <span className="text-xs" style={{ color: tc.primary + '60' }}>/{data?.book.totalChapters ?? 1}</span>
            <ChevronDownIcon className="w-4 h-4 shrink-0" style={{ color: tc.primary + '80' }} />
          </button>

          {/* 진행 바 */}
          <div className="flex-1 flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${totalVerses > 0 ? (readCount / totalVerses) * 100 : 0}%`, backgroundColor: tc.primary }} />
            </div>
            <span className="text-[10px] font-bold shrink-0" style={{ color: tc.primary }}>{readCount}/{totalVerses}</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: tc.primary + '33', borderTopColor: tc.primary }} />
          <div className="text-stone-400 text-sm">말씀을 불러오는 중...</div>
        </div>
      )}

      {!isLoading && (error || !data) && (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-sm">{error ?? '오류가 발생했습니다.'}</div>
        </div>
      )}

      {!isLoading && data && (
        <>

          <article
            className={`px-0 py-3 min-h-screen bible-text ${FONT_SIZE_CLASS[fontSize]} ${FONT_FAMILY_CLASS[fontFamily] ?? 'font-noto-sans-kr'}`}
            style={{
              backgroundImage: "url('/images/backgroundImg_01.jpg')",
              backgroundSize: '100% auto',
              backgroundRepeat: 'repeat-y',
              backgroundPosition: 'top center',
              backgroundColor: '#f5f2ed',
            }}
          >
            {data.verses.map((verse) => {
              const narrativeVerse = language === 'narrative' ? getNarrativeVerse(bookId, chapter, verse.verse) : null
              const easyVerse     = language === 'easy'      ? getEasyKoreanVerse(bookId, chapter, verse.verse) : null
              const rawText = easyVerse ?? narrativeVerse ?? (language === 'en' ? verse.textEn : (verse.textKo ?? verse.textEn))
              const text = rawText
                .replace(/&amp;/gi, '&')
                .replace(/&#(?:x([0-9a-fA-F]+)|([0-9]+));?/g, (_, hex, dec) =>
                  String.fromCharCode(hex ? parseInt(hex, 16) : parseInt(dec, 10)))
                .replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
              const displayText = (language === 'en' && !narrativeVerse && !easyVerse)
                ? text.replace(/: ([a-z])/g, ', $1')
                : text

              return (
                <VerseItem
                  key={verse.id}
                  id={verse.id}
                  verse={verse.verse}
                  text={displayText}
                  isRead={readVerseIds.has(verse.id)}
                  isSelected={selectedVerseId === verse.id}
                  noteColor={memoColors[verse.id]}
                  isHighlighted={highlightedVerse === verse.verse}
                  onRead={handleReadToggle}
                  onNote={handleNotePress}
                />
              )
            })}
          </article>

          <ChapterNavigator bookId={bookId} chapter={chapter} totalChapters={data.book.totalChapters} />

          {selectedVerseId && selectedVerse && (
            <VerseNoteModal
              verseId={selectedVerseId}
              verseRef={verseRef}
              correctionField={language === 'en' ? 'textEn' : 'textKo'}
              verseText={language === 'en' ? selectedVerse.textEn : (selectedVerse.textKo ?? selectedVerse.textEn)}
              initialMemo={memoColors[selectedVerseId] ? { content: memoContents[selectedVerseId] ?? '', color: memoColors[selectedVerseId] as import('@/lib/noteColors').NoteColor } : undefined}
              onClose={() => setSelectedVerseId(null)}
              onNoteSaved={(vid, color, content) => {
                setMemoColors((prev) => {
                  if (!color) { const next = { ...prev }; delete next[vid]; return next }
                  return { ...prev, [vid]: color }
                })
                setMemoContents((prev) => {
                  if (!color) { const next = { ...prev }; delete next[vid]; return next }
                  if (content !== undefined) return { ...prev, [vid]: content }
                  return prev
                })
              }}
            />
          )}
        </>
      )}

      {showBookSelector && (
        <BookSelector currentBookId={bookId} currentChapter={chapter}
          onClose={() => setShowBookSelector(false)} initialMode="book" />
      )}
      {showChapterSelector && (
        <BookSelector currentBookId={bookId} currentChapter={chapter}
          onClose={() => setShowChapterSelector(false)} initialMode="chapter" />
      )}
      {showSettings && <ReadingSettings onClose={() => setShowSettings(false)} />}

      {showLoginPrompt && (
        <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
      )}
    </MobileLayout>
  )
}

function LoginPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm mb-6 mx-4 bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a3d5c18' }}>
          <LockIcon className="w-7 h-7" style={{ color: '#1a3d5c' }} />
        </div>
        <div className="text-center">
          <p className="font-bold text-stone-800 text-base mb-1">로그인이 필요한 기능이에요</p>
          <p className="text-stone-400 text-sm">통독 체크, 메모는 로그인 후 이용할 수 있어요</p>
        </div>
        <Link
          href="/auth/login"
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-center shadow-md"
          style={{ backgroundColor: '#1a3d5c' }}
        >
          로그인하기
        </Link>
        <button onClick={onClose} className="text-stone-400 text-sm">
          계속 읽기
        </button>
      </div>
    </div>
  )
}

function LockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function ChevronDownIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
