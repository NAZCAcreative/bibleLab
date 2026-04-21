'use client'
import { useState, useCallback, useEffect } from 'react'
import { MobileLayout } from '@/presentation/components/layout/MobileLayout'
import { SearchBar } from '@/presentation/components/search/SearchBar'
import { SearchResultItem } from '@/presentation/components/search/SearchResultItem'
import { useSearch } from '@/presentation/hooks/useSearch'
import { useBibleStore, THEMES } from '@/store/bibleStore'

type SearchLang = 'ko' | 'en'

export default function SearchPage() {
  const { results, isLoading, error, search, clear } = useSearch()
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]

  const [searchLang, setSearchLang] = useState<SearchLang>('ko')
  const [inputValue, setInputValue] = useState('')
  const [enEnabled, setEnEnabled] = useState(true)
  const [langMismatch, setLangMismatch] = useState<SearchLang | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        const vis = d?.data?.bibleLangVisibility
        if (vis && vis.en === false) {
          setEnEnabled(false)
          setSearchLang('ko')
        }
      })
      .catch(() => {})
  }, [])

  const KO_RE = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/
  const EN_RE = /[a-zA-Z]/

  const handleChange = useCallback(
    (value: string, lang: SearchLang) => {
      setInputValue(value)
      // 언어 불일치 감지
      if (value.length >= 1) {
        if (lang === 'ko' && EN_RE.test(value) && !KO_RE.test(value)) {
          setLangMismatch('en')
        } else if (lang === 'en' && KO_RE.test(value) && !EN_RE.test(value)) {
          setLangMismatch('ko')
        } else {
          setLangMismatch(null)
        }
      } else {
        setLangMismatch(null)
      }
      if (value.trim().length >= 2) {
        search(value.trim(), lang)
      } else {
        clear()
      }
    },
    [search, clear]
  )

  const handleLangChange = useCallback(
    (lang: SearchLang) => {
      setSearchLang(lang)
      setLangMismatch(null)
      if (inputValue.trim().length >= 2) {
        search(inputValue.trim(), lang)
      }
    },
    [inputValue, search]
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    clear()
  }, [clear])

  return (
    <MobileLayout>
      {/* 검색창 + 언어 탭 */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md px-4 pt-3 pb-2 border-b" style={{ borderColor: tc.primary + '33' }}>
        <div className="flex items-center gap-2">

          {enEnabled && (
            <div className="relative shrink-0">
              <select
                value={searchLang}
                onChange={(e) => {
                  const lang = e.target.value as SearchLang
                  setSearchLang(lang)
                  setInputValue('')
                  clear()
                }}
                className="h-10 pl-2.5 pr-8 rounded-xl text-xs font-bold border-0 appearance-none focus:outline-none cursor-pointer"
                style={{ backgroundColor: tc.primary, color: '#fff' }}
              >
                <option value="ko">한국어 (개역개정)</option>
                <option value="en">영어 (KJV)</option>
              </select>
              <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <SearchBar
              value={inputValue}
              onChange={(v) => handleChange(v, searchLang)}
              onClear={handleClear}
              isLoading={isLoading}
              autoFocus
              lang={searchLang}
            />
          </div>
        </div>

        {/* 언어 불일치 안내 배너 */}
        {langMismatch && enEnabled && (
          <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: tc.primary + '12', color: tc.primary }}>
            <span>
              {langMismatch === 'ko' ? '🇰🇷 한국어로 검색하시나요?' : '🇺🇸 Searching in English?'}
            </span>
            <button
              onClick={() => handleLangChange(langMismatch)}
              className="ml-3 px-3 py-1 rounded-lg text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: tc.primary }}>
              {langMismatch === 'ko' ? '한국어로 전환' : 'Switch to English'}
            </button>
          </div>
        )}
      </div>

      {/* 결과 영역 */}
      <div>
        {error && (
          <div className="px-4 py-3 text-sm text-red-500 bg-red-50">{error}</div>
        )}

        {!inputValue && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400">
            <SearchEmptyIcon className="w-12 h-12 mb-3 text-stone-300" />
            <p className="text-sm">{searchLang === 'ko' ? '한국어로 검색하세요 (초성 가능)' : 'Search in English'}</p>
          </div>
        )}

        {inputValue.trim().length >= 2 && !isLoading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400">
            <p className="text-sm">
              <span className="font-medium text-stone-600">&ldquo;{inputValue}&rdquo;</span>에 대한 결과가 없습니다
            </p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="px-4 py-2 text-xs text-stone-400">검색 결과 {results.length}건</p>
            <div className="divide-y divide-stone-50">
              {results.map((verse) => {
                const text = searchLang === 'ko' && verse.textKo ? verse.textKo : verse.textEn
                return (
                  <SearchResultItem
                    key={verse.id}
                    id={verse.id}
                    bookId={verse.bookId}
                    bookNameKo={verse.book.nameKo}
                    chapter={verse.chapter}
                    verse={verse.verse}
                    text={text}
                    query={inputValue}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  )
}

function SearchEmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}
