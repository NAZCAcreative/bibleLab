'use client'
// Design Ref: §6.2 — Zustand 전역 상태 (읽기 위치, 언어, 폰트 크기)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'ko' | 'en' | 'narrative' | 'easy'
export type FontSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type LineHeight = 'tight' | 'normal' | 'relaxed' | 'loose'
export const LINE_HEIGHT_CLASS: Record<LineHeight, string> = {
  tight:   'leading-tight',
  normal:  'leading-normal',
  relaxed: 'leading-relaxed',
  loose:   'leading-loose',
}
export type VerseSpacing = 'compact' | 'normal' | 'relaxed' | 'loose'
export const VERSE_SPACING_CLASS: Record<VerseSpacing, string> = {
  compact: 'py-1',
  normal:  'py-3',
  relaxed: 'py-5',
  loose:   'py-7',
}
export type FontCategory = 'korean' | 'english'
export type Theme = 'basic' | 'eden' | 'forest' | 'amber' | 'violet' | 'rose' | 'slate' | 'sky' | 'coral' | 'olive' | 'navy' | 'teal'

export interface ThemeColors { primary: string; light: string; name: string }
export const THEMES: Record<Theme, ThemeColors> = {
  basic:  { primary: '#6b7280', light: '#f3f4f6', name: '기본'    },
  eden:   { primary: '#1a3d5c', light: '#e8f0f7', name: '에덴'    },
  forest: { primary: '#166534', light: '#dcfce7', name: '숲속'    },
  amber:  { primary: '#b45309', light: '#fef3c7', name: '황금'    },
  violet: { primary: '#6d28d9', light: '#ede9fe', name: '보라'    },
  rose:   { primary: '#be123c', light: '#fff1f2', name: '장미'    },
  slate:  { primary: '#334155', light: '#f1f5f9', name: '슬레이트' },
  sky:    { primary: '#0284c7', light: '#e0f2fe', name: '하늘'    },
  coral:  { primary: '#c2410c', light: '#fff7ed', name: '산호'    },
  olive:  { primary: '#4d7c0f', light: '#f7fee7', name: '올리브'  },
  navy:   { primary: '#1e3a8a', light: '#eff6ff', name: '네이비'  },
  teal:   { primary: '#0f766e', light: '#f0fdfa', name: '청록'    },
}
export type FontFamily =
  // ── 한글 30개 ─────────────────────────────────
  | 'noto-sans-kr' | 'noto-serif-kr' | 'gothic-a1' | 'nanum-gothic' | 'nanum-myeongjo'
  | 'nanum-gothic-coding' | 'black-han-sans' | 'do-hyeon' | 'jua' | 'sunflower'
  | 'gaegu' | 'gamja-flower' | 'hi-melody' | 'kirang-haerang' | 'yeon-sung'
  | 'poor-story' | 'east-sea-dokdo' | 'cute-font' | 'song-myung' | 'nanum-pen-script'
  | 'gugi' | 'gowun-dodum' | 'gowun-batang' | 'orbit' | 'hahmlet'
  | 'ibm-plex-sans-kr' | 'single-day' | 'dokdo' | 'nanum-brush-script' | 'black-and-white-picture'
  // ── 영문 30개 ─────────────────────────────────
  | 'lora' | 'merriweather' | 'eb-garamond' | 'playfair-display' | 'crimson-text'
  | 'cormorant-garamond' | 'libre-baskerville' | 'spectral' | 'pt-serif' | 'alegreya'
  | 'josefin-sans' | 'raleway' | 'nunito' | 'open-sans' | 'poppins'
  | 'work-sans' | 'dm-sans' | 'source-serif-4' | 'frank-ruhl-libre' | 'inter'
  | 'roboto' | 'montserrat' | 'ubuntu' | 'oswald' | 'lato'
  | 'source-code-pro' | 'roboto-slab' | 'bitter' | 'arvo' | 'vollkorn'

export type HistoryItem = {
  bookId: number
  bookNameKo: string
  chapter: number
  viewedAt: number
  readVerseCount?: number
}

interface BibleState {
  currentBookId: number
  currentChapter: number
  language: Language
  fontSize: FontSize
  fontFamily: FontFamily
  fontBold: boolean
  lineHeight: LineHeight
  verseSpacing: VerseSpacing
  theme: Theme
  readingHistory: HistoryItem[]
  setPosition: (bookId: number, chapter: number) => void
  setLanguage: (lang: Language) => void
  setFontSize: (size: FontSize) => void
  setFontFamily: (family: FontFamily) => void
  setFontBold: (bold: boolean) => void
  setLineHeight: (lh: LineHeight) => void
  setVerseSpacing: (vs: VerseSpacing) => void
  setTheme: (theme: Theme) => void
  addToHistory: (bookId: number, bookNameKo: string, chapter: number) => void
  updateHistoryReadCount: (bookId: number, chapter: number, count: number) => void
}

const LEGACY_MAP: Record<string, FontFamily> = {
  'noto-sans':  'noto-sans-kr',
  'noto-serif': 'noto-serif-kr',
  'sans':       'noto-sans-kr',
  'serif':      'noto-serif-kr',
  'playfair':   'playfair-display',
  'cormorant':  'cormorant-garamond',
  'frank-ruhl': 'frank-ruhl-libre',
}

function normalizeFontFamily(f: unknown): FontFamily {
  if (typeof f !== 'string') return 'noto-sans-kr'
  if (f in LEGACY_MAP) return LEGACY_MAP[f]
  if (f in FONT_FAMILY_CLASS) return f as FontFamily
  return 'noto-sans-kr'
}

export const useBibleStore = create<BibleState>()(
  persist<BibleState>(
    (set) => ({
      currentBookId: 43,
      currentChapter: 1,
      language: 'ko',
      fontSize: 'md',
      fontFamily: 'noto-sans-kr',
      fontBold: false,
      lineHeight: 'relaxed',
      verseSpacing: 'normal',
      theme: 'eden',
      readingHistory: [],

      setPosition: (bookId, chapter) => set({ currentBookId: bookId, currentChapter: chapter }),
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontBold: (fontBold) => set({ fontBold }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setVerseSpacing: (verseSpacing) => set({ verseSpacing }),
      setTheme: (theme) => set({ theme }),
      addToHistory: (bookId, bookNameKo, chapter) =>
        set((state) => {
          const filtered = state.readingHistory.filter((h) => h.bookId !== bookId)
          const next = [{ bookId, bookNameKo, chapter, viewedAt: Date.now() }, ...filtered].slice(0, 10)
          return { readingHistory: next }
        }),
      updateHistoryReadCount: (bookId, chapter, count) =>
        set((state) => ({
          readingHistory: state.readingHistory.map((h) =>
            h.bookId === bookId && h.chapter === chapter ? { ...h, readVerseCount: count } : h
          ),
        })),
    }),
    {
      name: 'bible-store',
      skipHydration: true,
      partialize: (state) => {
        // language는 세션마다 독립적으로 시작해야 하므로 persist 제외
        const { language: _lang, ...rest } = state
        return rest as unknown as BibleState
      },
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<BibleState>
        return { ...current, ...p, fontFamily: normalizeFontFamily(p?.fontFamily) }
      },
    }
  )
)

export const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm:  'text-base leading-relaxed',
  md:  'text-lg leading-relaxed',
  lg:  'text-xl leading-relaxed',
  xl:  'text-[22px] leading-loose',
  xxl: 'text-[26px] leading-loose',
}

export const FONT_FAMILY_CLASS: Record<FontFamily, string> = {
  // 한글
  'noto-sans-kr':             'font-noto-sans-kr',
  'noto-serif-kr':            'font-noto-serif-kr',
  'gothic-a1':                'font-gothic-a1',
  'nanum-gothic':             'font-nanum-gothic',
  'nanum-myeongjo':           'font-nanum-myeongjo',
  'nanum-gothic-coding':      'font-nanum-gothic-coding',
  'black-han-sans':           'font-black-han-sans',
  'do-hyeon':                 'font-do-hyeon',
  'jua':                      'font-jua',
  'sunflower':                'font-sunflower',
  'gaegu':                    'font-gaegu',
  'gamja-flower':             'font-gamja-flower',
  'hi-melody':                'font-hi-melody',
  'kirang-haerang':           'font-kirang-haerang',
  'yeon-sung':                'font-yeon-sung',
  'poor-story':               'font-poor-story',
  'east-sea-dokdo':           'font-east-sea-dokdo',
  'cute-font':                'font-cute-font',
  'song-myung':               'font-song-myung',
  'nanum-pen-script':         'font-nanum-pen-script',
  'gugi':                     'font-gugi',
  'gowun-dodum':              'font-gowun-dodum',
  'gowun-batang':             'font-gowun-batang',
  'orbit':                    'font-orbit',
  'hahmlet':                  'font-hahmlet',
  'ibm-plex-sans-kr':         'font-ibm-plex-sans-kr',
  'single-day':               'font-single-day',
  'dokdo':                    'font-dokdo',
  'nanum-brush-script':       'font-nanum-brush-script',
  'black-and-white-picture':  'font-black-and-white-picture',
  // 영문
  'lora':               'font-lora',
  'merriweather':       'font-merriweather',
  'eb-garamond':        'font-eb-garamond',
  'playfair-display':   'font-playfair-display',
  'crimson-text':       'font-crimson-text',
  'cormorant-garamond': 'font-cormorant-garamond',
  'libre-baskerville':  'font-libre-baskerville',
  'spectral':           'font-spectral',
  'pt-serif':           'font-pt-serif',
  'alegreya':           'font-alegreya',
  'josefin-sans':       'font-josefin-sans',
  'raleway':            'font-raleway',
  'nunito':             'font-nunito',
  'open-sans':          'font-open-sans',
  'poppins':            'font-poppins',
  'work-sans':          'font-work-sans',
  'dm-sans':            'font-dm-sans',
  'source-serif-4':     'font-source-serif-4',
  'frank-ruhl-libre':   'font-frank-ruhl-libre',
  'inter':              'font-inter',
  'roboto':             'font-roboto',
  'montserrat':         'font-montserrat',
  'ubuntu':             'font-ubuntu',
  'oswald':             'font-oswald',
  'lato':               'font-lato',
  'source-code-pro':    'font-source-code-pro',
  'roboto-slab':        'font-roboto-slab',
  'bitter':             'font-bitter',
  'arvo':               'font-arvo',
  'vollkorn':           'font-vollkorn',
}

export const FONT_FAMILY_LABEL: Record<FontFamily, string> = {
  'noto-sans-kr':             'Noto Sans KR',
  'noto-serif-kr':            'Noto Serif KR',
  'gothic-a1':                'Gothic A1',
  'nanum-gothic':             '나눔고딕',
  'nanum-myeongjo':           '나눔명조',
  'nanum-gothic-coding':      '나눔고딕코딩',
  'black-han-sans':           '블랙한산스',
  'do-hyeon':                 '도현',
  'jua':                      '주아',
  'sunflower':                '해바라기',
  'gaegu':                    '개구',
  'gamja-flower':             '감자꽃',
  'hi-melody':                '하이멜로디',
  'kirang-haerang':           '기랑해랑',
  'yeon-sung':                '연성',
  'poor-story':               '푸어스토리',
  'east-sea-dokdo':           '독도체',
  'cute-font':                '귀여운폰트',
  'song-myung':               '송명',
  'nanum-pen-script':         '나눔펜스크립트',
  'gugi':                     '구기',
  'gowun-dodum':              '고운돋움',
  'gowun-batang':             '고운바탕',
  'orbit':                    '오빗',
  'hahmlet':                  '함렛',
  'ibm-plex-sans-kr':         'IBM Plex Sans KR',
  'single-day':               '하루',
  'dokdo':                    '독도',
  'nanum-brush-script':       '나눔브러쉬',
  'black-and-white-picture':  '흑백사진',
  'lora':               'Lora',
  'merriweather':       'Merriweather',
  'eb-garamond':        'EB Garamond',
  'playfair-display':   'Playfair Display',
  'crimson-text':       'Crimson Text',
  'cormorant-garamond': 'Cormorant Garamond',
  'libre-baskerville':  'Libre Baskerville',
  'spectral':           'Spectral',
  'pt-serif':           'PT Serif',
  'alegreya':           'Alegreya',
  'josefin-sans':       'Josefin Sans',
  'raleway':            'Raleway',
  'nunito':             'Nunito',
  'open-sans':          'Open Sans',
  'poppins':            'Poppins',
  'work-sans':          'Work Sans',
  'dm-sans':            'DM Sans',
  'source-serif-4':     'Source Serif 4',
  'frank-ruhl-libre':   'Frank Ruhl Libre',
  'inter':              'Inter',
  'roboto':             'Roboto',
  'montserrat':         'Montserrat',
  'ubuntu':             'Ubuntu',
  'oswald':             'Oswald',
  'lato':               'Lato',
  'source-code-pro':    'Source Code Pro',
  'roboto-slab':        'Roboto Slab',
  'bitter':             'Bitter',
  'arvo':               'Arvo',
  'vollkorn':           'Vollkorn',
}

export const FONT_CATEGORY: Record<FontFamily, FontCategory> = {
  'noto-sans-kr': 'korean', 'noto-serif-kr': 'korean', 'gothic-a1': 'korean',
  'nanum-gothic': 'korean', 'nanum-myeongjo': 'korean', 'nanum-gothic-coding': 'korean',
  'black-han-sans': 'korean', 'do-hyeon': 'korean', 'jua': 'korean', 'sunflower': 'korean',
  'gaegu': 'korean', 'gamja-flower': 'korean', 'hi-melody': 'korean', 'kirang-haerang': 'korean',
  'yeon-sung': 'korean', 'poor-story': 'korean', 'east-sea-dokdo': 'korean', 'cute-font': 'korean',
  'song-myung': 'korean', 'nanum-pen-script': 'korean', 'gugi': 'korean', 'gowun-dodum': 'korean',
  'gowun-batang': 'korean', 'orbit': 'korean', 'hahmlet': 'korean', 'ibm-plex-sans-kr': 'korean',
  'single-day': 'korean', 'dokdo': 'korean', 'nanum-brush-script': 'korean',
  'black-and-white-picture': 'korean',
  'lora': 'english', 'merriweather': 'english', 'eb-garamond': 'english',
  'playfair-display': 'english', 'crimson-text': 'english', 'cormorant-garamond': 'english',
  'libre-baskerville': 'english', 'spectral': 'english', 'pt-serif': 'english', 'alegreya': 'english',
  'josefin-sans': 'english', 'raleway': 'english', 'nunito': 'english', 'open-sans': 'english',
  'poppins': 'english', 'work-sans': 'english', 'dm-sans': 'english', 'source-serif-4': 'english',
  'frank-ruhl-libre': 'english', 'inter': 'english', 'roboto': 'english', 'montserrat': 'english',
  'ubuntu': 'english', 'oswald': 'english', 'lato': 'english', 'source-code-pro': 'english',
  'roboto-slab': 'english', 'bitter': 'english', 'arvo': 'english', 'vollkorn': 'english',
}
