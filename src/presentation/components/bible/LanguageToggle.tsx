'use client'
import { useEffect, useState } from 'react'
import { useBibleStore, THEMES } from '@/store/bibleStore'
import type { Language } from '@/store/bibleStore'
import { hasNarrativeChapter } from '@/data/narrativeGenesis'
import { hasEasyKoreanChapter } from '@/data/easyKoreanGenesis'

interface LanguageToggleProps {
  bookId: number
  chapter: number
}

type Visibility = Record<Language, boolean>

const ALL_MODES: { value: Language; label: string }[] = [
  { value: 'ko',        label: '개역'   },
  { value: 'en',        label: 'KJV'    },
  { value: 'narrative', label: '서사'   },
  { value: 'easy',      label: '쉬운말' },
]

const DEFAULT_VIS: Visibility = { ko: true, en: true, narrative: true, easy: true }

export function LanguageToggle({ bookId, chapter }: LanguageToggleProps) {
  const { language, setLanguage, theme } = useBibleStore()
  const tc = THEMES[theme]
  const showNarrative = hasNarrativeChapter(bookId, chapter)
  const showEasy      = hasEasyKoreanChapter(bookId, chapter)

  const [visibility, setVisibility] = useState<Visibility>(DEFAULT_VIS)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.bibleLangVisibility) {
          setVisibility({ ...DEFAULT_VIS, ...d.data.bibleLangVisibility })
        }
      })
      .catch(() => {})
  }, [])

  const modes = ALL_MODES.filter((m) => {
    if (!visibility[m.value]) return false
    if (m.value === 'narrative') return showNarrative
    if (m.value === 'easy')      return showEasy
    return true
  })

  useEffect(() => {
    if (language === 'narrative' && (!showNarrative || !visibility.narrative)) setLanguage('ko')
    if (language === 'easy'      && (!showEasy      || !visibility.easy))      setLanguage('ko')
    if (language === 'en'        && !visibility.en)  setLanguage('ko')
  }, [showNarrative, showEasy, language, setLanguage, visibility])

  const currentLang =
    (language === 'narrative' && (!showNarrative || !visibility.narrative)) ? 'ko' :
    (language === 'easy'      && (!showEasy      || !visibility.easy))      ? 'ko' :
    (language === 'en'        && !visibility.en) ? 'ko' : language

  if (modes.length <= 1) return null

  return (
    <div className="flex w-full">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setLanguage(mode.value)}
          className={`flex-1 py-2.5 text-sm font-bold transition-all border-b-2 ${
            currentLang !== mode.value ? 'text-stone-400 border-transparent active:text-stone-600' : ''
          }`}
          style={currentLang === mode.value
            ? { color: tc.primary, borderColor: tc.primary }
            : undefined}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
