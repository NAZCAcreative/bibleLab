'use client'
import { useState, useEffect } from 'react'
import { useBibleStore, THEMES } from '@/store/bibleStore'

type LiturgyText = { id: string; type: string; version: string; content: string; isDefault: boolean; sortOrder: number }
type Tab = 'creed' | 'prayer'

interface PrayerModalProps {
  onClose: () => void
}

export function PrayerModal({ onClose }: PrayerModalProps) {
  const [tab, setTab] = useState<Tab>('creed')
  const [texts, setTexts] = useState<{ creed: LiturgyText[]; prayer: LiturgyText[] }>({ creed: [], prayer: [] })
  const [creedVersion, setCreedVersion] = useState<string>('')
  const [prayerVersion, setPrayerVersion] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const theme = useBibleStore((s) => s.theme)
  const fontSize = useBibleStore((s) => s.fontSize)
  const tc = THEMES[theme]
  const CONTENT_SIZE: Record<string, string> = { sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-[22px]', xxl: 'text-[26px]' }

  useEffect(() => {
    fetch('/api/liturgy')
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          setTexts(d.data)
          const defCreed = d.data.creed.find((t: LiturgyText) => t.isDefault) ?? d.data.creed[0]
          const defPrayer = d.data.prayer.find((t: LiturgyText) => t.isDefault) ?? d.data.prayer[0]
          if (defCreed) setCreedVersion(defCreed.version)
          if (defPrayer) setPrayerVersion(defPrayer.version)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const list = tab === 'creed' ? texts.creed : texts.prayer
  const selectedVersion = tab === 'creed' ? creedVersion : prayerVersion
  const setVersion = tab === 'creed' ? setCreedVersion : setPrayerVersion
  const current = list.find((t) => t.version === selectedVersion)

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="bg-stone-50 rounded-t-3xl shadow-2xl flex flex-col" style={{ height: '75vh' }}>
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 bg-stone-300 rounded-full" />
        </div>

        <header className="flex items-center justify-between px-4 h-11 shrink-0">
          <h1 className="text-base font-bold text-stone-800">기도문</h1>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 active:bg-stone-100">
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        {/* 사도신경 / 주기도문 탭 */}
        <div className="px-4 pb-2 shrink-0">
          <div className="flex gap-1.5">
            {(['creed', 'prayer'] as Tab[]).map((t) => (
              <button key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 rounded-xl text-base font-bold transition-colors ${tab !== t ? 'bg-stone-100 text-stone-500' : 'text-white'}`}
                style={tab === t ? { backgroundColor: tc.primary } : undefined}>
                {t === 'creed' ? '사도신경' : '주기도문'}
              </button>
            ))}
          </div>
        </div>

        {/* 버전 선택 */}
        {list.length > 1 && (
          <div className="px-4 pb-3 shrink-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-0.5">
              {list.map((t) => (
                <button key={t.version}
                  onClick={() => setVersion(t.version)}
                  className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  style={selectedVersion === t.version
                    ? { backgroundColor: tc.primary + '20', color: tc.primary, boxShadow: `0 0 0 1.5px ${tc.primary}` }
                    : { backgroundColor: '#f5f5f4', color: '#78716c' }}>
                  {t.version}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 min-h-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: tc.primary + '33', borderTopColor: tc.primary }} />
            </div>
          ) : current ? (
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: tc.light }}>
              <p className={`${CONTENT_SIZE[fontSize] ?? 'text-base'} leading-loose text-stone-800 whitespace-pre-line font-noto-serif-kr`}>
                {current.content}
              </p>
            </div>
          ) : (
            <p className="text-center text-stone-400 text-sm py-10">내용을 불러올 수 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
