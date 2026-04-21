'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useBibleStore, THEMES } from '@/store/bibleStore'
import { PrayerModal } from '@/presentation/components/bible/PrayerModal'

interface TopBarProps {
  onSettingsOpen?: () => void
}

export function TopBar({ onSettingsOpen }: TopBarProps) {
  const router = useRouter()
  const { currentBookId, currentChapter, theme, readingHistory } = useBibleStore()
  const tc = THEMES[theme]
  const [showPrayer, setShowPrayer] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyDot, setHistoryDot] = useState(true)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/60">
        <div className="flex items-center h-16 px-4 gap-3">

          <button
            onClick={() => router.push(`/bible/${currentBookId}/${currentChapter}`)}
            className="shrink-0 active:opacity-70 transition-opacity"
          >
            <Image
              src="/images/logo_01.PNG"
              alt="EDENBible"
              width={130}
              height={26}
              style={{ height: '26px', width: 'auto' }}
              className="object-contain"
              priority
            />
          </button>

          <div className="flex-1" />

          {/* 히스토리 버튼 */}
          {readingHistory.length > 0 && (
            <button
              onClick={() => { setShowHistory(true); setHistoryDot(false) }}
              className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-stone-100 transition-colors shrink-0 relative"
              style={{ color: tc.primary + '99' }}
              aria-label="최근 읽은 곳"
            >
              <HistoryIcon className="w-6 h-6" />
              {historyDot && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: tc.primary }} />
              )}
            </button>
          )}

          <button
            onClick={() => setShowPrayer(true)}
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-stone-100 transition-colors shrink-0"
            style={{ color: tc.primary + '99' }}
            aria-label="사도신경 / 주기도문"
          >
            <PrayerIcon className="w-6 h-6" />
          </button>

          <button
            onClick={onSettingsOpen}
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-stone-100 transition-colors shrink-0"
            style={{ color: tc.primary + '99' }}
            aria-label="읽기 설정"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>

        </div>
      </header>

      {showPrayer && <PrayerModal onClose={() => setShowPrayer(false)} />}

      {/* 히스토리 시트 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/40" onClick={() => setShowHistory(false)} />
          <div className="bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: '60vh' }}>
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-9 h-1 bg-stone-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-4 h-11">
              <h2 className="text-base font-bold text-stone-800">최근 읽은 곳</h2>
              <button onClick={() => setShowHistory(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 active:bg-stone-100">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto pb-6" style={{ maxHeight: 'calc(60vh - 80px)' }}>
              {readingHistory.map((item, i) => (
                <button
                  key={`${item.bookId}-${item.chapter}`}
                  onClick={() => {
                    setShowHistory(false)
                    const verse = item.readVerseCount && item.readVerseCount > 0 ? `?verse=${item.readVerseCount}` : ''
                    router.push(`/bible/${item.bookId}/${item.chapter}${verse}`)
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 active:bg-stone-50 transition-colors border-b border-stone-100 last:border-0"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                      style={{ backgroundColor: i === 0 ? tc.primary : tc.primary + '55' }}>
                      {i === 0 ? '▶' : i + 1}
                    </div>
                    <div className="text-left">
                      <p className="text-base font-bold text-stone-800">
                        {item.bookNameKo} {item.chapter}장
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {formatHistoryDate(item.viewedAt)}
                        {(item.readVerseCount ?? 0) > 0 && (
                          <span className="ml-2 font-semibold" style={{ color: tc.primary + 'cc' }}>
                            {item.readVerseCount}절
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-stone-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function formatHistoryDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}시간 전`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  )
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
function PrayerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
