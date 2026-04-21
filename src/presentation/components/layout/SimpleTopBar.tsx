'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useBibleStore, THEMES } from '@/store/bibleStore'
import { PrayerModal } from '@/presentation/components/bible/PrayerModal'
import { ReadingSettings } from '@/presentation/components/bible/ReadingSettings'

export function SimpleTopBar() {
  const router = useRouter()
  const { currentBookId, currentChapter, theme } = useBibleStore()
  const tc = THEMES[theme]
  const [showPrayer, setShowPrayer] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

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
              className="h-[26px] w-auto object-contain"
              priority
            />
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setShowPrayer(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl active:bg-stone-100 transition-colors shrink-0"
            style={{ color: tc.primary + '99' }}
            aria-label="사도신경 / 주기도문"
          >
            <PrayerIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl active:bg-stone-100 transition-colors shrink-0"
            style={{ color: tc.primary + '99' }}
            aria-label="읽기 설정"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {showPrayer && <PrayerModal onClose={() => setShowPrayer(false)} />}
      {showSettings && <ReadingSettings onClose={() => setShowSettings(false)} />}
    </>
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
