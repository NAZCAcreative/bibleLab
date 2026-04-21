'use client'
import { useState } from 'react'
import {
  useBibleStore, FONT_FAMILY_CLASS, FONT_FAMILY_LABEL, FONT_CATEGORY, THEMES,
  type FontSize, type FontFamily, type FontCategory, type Theme, type VerseSpacing, type LineHeight,
} from '@/store/bibleStore'

interface ReadingSettingsProps {
  onClose: () => void
}

const LINE_HEIGHTS: { value: LineHeight; label: string }[] = [
  { value: 'tight',   label: '좁게'    },
  { value: 'normal',  label: '보통'    },
  { value: 'relaxed', label: '넓게'    },
  { value: 'loose',   label: '매우넓게' },
]

const VERSE_SPACINGS: { value: VerseSpacing; label: string }[] = [
  { value: 'compact', label: '좁게'   },
  { value: 'normal',  label: '보통'   },
  { value: 'relaxed', label: '넓게'   },
  { value: 'loose',   label: '매우넓게' },
]

const FONT_SIZES: { value: FontSize; label: string; description: string }[] = [
  { value: 'sm',  label: '작게',    description: '16px' },
  { value: 'md',  label: '보통',    description: '18px' },
  { value: 'lg',  label: '크게',    description: '20px' },
  { value: 'xl',  label: '매우크게', description: '22px' },
  { value: 'xxl', label: '더크게',  description: '26px' },
]

const KOREAN_FONTS: FontFamily[] = [
  'noto-sans-kr', 'noto-serif-kr', 'gothic-a1', 'nanum-gothic', 'nanum-myeongjo',
  'nanum-gothic-coding', 'black-han-sans', 'do-hyeon', 'jua', 'sunflower',
  'gaegu', 'gamja-flower', 'hi-melody', 'kirang-haerang', 'yeon-sung',
  'poor-story', 'east-sea-dokdo', 'cute-font', 'song-myung', 'nanum-pen-script',
  'gugi', 'gowun-dodum', 'gowun-batang', 'orbit', 'hahmlet',
  'ibm-plex-sans-kr', 'single-day', 'dokdo', 'nanum-brush-script', 'black-and-white-picture',
]

const ENGLISH_FONTS: FontFamily[] = [
  'lora', 'merriweather', 'eb-garamond', 'playfair-display', 'crimson-text',
  'cormorant-garamond', 'libre-baskerville', 'spectral', 'pt-serif', 'alegreya',
  'josefin-sans', 'raleway', 'nunito', 'open-sans', 'poppins',
  'work-sans', 'dm-sans', 'source-serif-4', 'frank-ruhl-libre', 'inter',
  'roboto', 'montserrat', 'ubuntu', 'oswald', 'lato',
  'source-code-pro', 'roboto-slab', 'bitter', 'arvo', 'vollkorn',
]

const LIST_PREVIEW_KO = '태초에 하나님이'
const LIST_PREVIEW_EN = 'In the beginning'

export function ReadingSettings({ onClose }: ReadingSettingsProps) {
  const { fontSize, setFontSize, fontFamily, setFontFamily, fontBold, setFontBold, lineHeight, setLineHeight, verseSpacing, setVerseSpacing, theme, setTheme, language } = useBibleStore()
  const defaultCategory: FontCategory = language === 'en' ? 'english' : (FONT_CATEGORY[fontFamily] ?? 'korean')
  const [activeCategory, setActiveCategory] = useState<FontCategory>(defaultCategory)

  const fonts = activeCategory === 'korean' ? KOREAN_FONTS : ENGLISH_FONTS
  const listPreviewText = activeCategory === 'english' ? LIST_PREVIEW_EN : LIST_PREVIEW_KO
  const tc = THEMES[theme]

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="bg-stone-50 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '72vh' }}>
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 bg-stone-300 rounded-full" />
        </div>

        <header className="flex items-center justify-between px-4 h-11 shrink-0">
          <h1 className="text-base font-bold text-stone-800">읽기 설정</h1>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 active:bg-stone-100">
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        {/* 글자 크기 — 고정 영역 (스왑: 미리보기 자리) */}
        <div className="shrink-0 bg-white border-b border-stone-100 px-4 pt-2.5 pb-3">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">글자 크기</p>
          <div className="grid grid-cols-5 gap-1.5">
            {FONT_SIZES.map(({ value, label, description }) => (
              <button key={value} onClick={() => setFontSize(value)}
                className="flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-colors"
                style={fontSize === value
                  ? { backgroundColor: tc.primary, borderColor: tc.primary, color: '#fff' }
                  : undefined}
              >
                <span className={`text-base font-bold leading-tight ${fontSize !== value ? 'text-stone-600' : ''}`}>{label}</span>
                <span className="text-sm mt-0.5"
                  style={{ color: fontSize === value ? '#ffffffaa' : '#9ca3af' }}>
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 줄 간격 */}
        <div className="shrink-0 bg-white border-b border-stone-100 px-4 pt-2.5 pb-3">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">줄 간격</p>
          <div className="grid grid-cols-4 gap-1.5">
            {LINE_HEIGHTS.map(({ value, label }) => (
              <button key={value} onClick={() => setLineHeight(value)}
                className="flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-colors"
                style={lineHeight === value
                  ? { backgroundColor: tc.primary, borderColor: tc.primary, color: '#fff' }
                  : undefined}
              >
                <span className={`text-base font-bold leading-tight ${lineHeight !== value ? 'text-stone-600' : ''}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 절 간격 */}
        <div className="shrink-0 bg-white border-b border-stone-100 px-4 pt-2.5 pb-3">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">절 간격</p>
          <div className="grid grid-cols-4 gap-1.5">
            {VERSE_SPACINGS.map(({ value, label }) => (
              <button key={value} onClick={() => setVerseSpacing(value)}
                className="flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-colors"
                style={verseSpacing === value
                  ? { backgroundColor: tc.primary, borderColor: tc.primary, color: '#fff' }
                  : undefined}
              >
                <span className={`text-base font-bold leading-tight ${verseSpacing !== value ? 'text-stone-600' : ''}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-3">

          {/* 테마 색상 */}
          <section className="bg-white rounded-2xl shadow-sm px-4 py-3">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">테마 색상</p>
            <div className="grid grid-cols-4 gap-3 place-items-center">
              {(Object.entries(THEMES) as [Theme, typeof tc][]).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className="active:scale-95 transition-transform flex justify-center"
                >
                  <div
                    className="w-12 h-12 rounded-full transition-all flex items-center justify-center"
                    style={{
                      backgroundColor: t.primary,
                      outline: theme === key ? `3px solid ${t.primary}` : '3px solid transparent',
                      outlineOffset: '3px',
                      transform: theme === key ? 'scale(1.1)' : undefined,
                    }}
                  >
                    <span className="text-[11px] font-black text-white leading-none drop-shadow">{t.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 폰트 미리보기 + 볼드 토글 */}
          <div className={`px-4 py-3 bg-white rounded-2xl shadow-sm ${FONT_FAMILY_CLASS[fontFamily]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-base text-stone-700 leading-relaxed ${fontBold ? 'font-bold' : 'font-normal'}`}>
                  태초에 하나님이 천지를 창조하시니라
                </p>
                <p className="text-sm text-stone-400 mt-1">{FONT_FAMILY_LABEL[fontFamily]}</p>
              </div>
              <button
                onClick={() => setFontBold(!fontBold)}
                className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 transition-colors"
                style={fontBold
                  ? { backgroundColor: tc.primary, borderColor: tc.primary, color: '#fff' }
                  : { borderColor: '#d1d5db', color: '#9ca3af', backgroundColor: '#fff' }}
              >
                <span className={`text-xl leading-none ${fontBold ? 'font-bold' : 'font-normal'}`}>B</span>
                <span className="text-sm mt-0.5 font-bold">{fontBold ? '굵게' : '보통'}</span>
              </button>
            </div>
          </div>

          {/* 폰트 목록 */}
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 pt-3 pb-2">
              <div className="flex gap-2">
                {(['korean', 'english'] as FontCategory[]).map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className="flex-1 py-2 rounded-xl text-base font-bold transition-colors"
                    style={activeCategory === cat
                      ? { backgroundColor: tc.primary, color: '#fff' }
                      : undefined}
                  >
                    <span className={activeCategory !== cat ? 'text-stone-500' : ''}>
                      {cat === 'korean' ? '한글 폰트 (30)' : '영문 폰트 (30)'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {fonts.map((font) => {
                const isSelected = fontFamily === font
                return (
                  <button key={font} onClick={() => setFontFamily(font)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-colors active:bg-stone-50"
                    style={isSelected ? { backgroundColor: tc.light } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                        style={isSelected ? { borderColor: tc.primary, backgroundColor: tc.primary } : { borderColor: '#d1d5db' }}>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-base font-semibold" style={{ color: isSelected ? tc.primary : '#374151' }}>
                        {FONT_FAMILY_LABEL[font]}
                      </span>
                    </div>
                    <span className={`text-base ${FONT_FAMILY_CLASS[font]}`} style={{ color: isSelected ? tc.primary : '#9ca3af' }}>
                      {listPreviewText}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
