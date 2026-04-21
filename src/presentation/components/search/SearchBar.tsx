'use client'
import React, { useRef, useEffect } from 'react'
import { useBibleStore, THEMES } from '@/store/bibleStore'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  isLoading?: boolean
  autoFocus?: boolean
  lang?: 'ko' | 'en'
}

const KO_RE = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/
const EN_RE = /[a-zA-Z]/

function filterByLang(value: string, lang?: 'ko' | 'en'): string {
  if (lang === 'ko') return value.replace(/[a-zA-Z]/g, '')
  if (lang === 'en') return value.replace(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/g, '')
  return value
}

export function SearchBar({
  value,
  onChange,
  onClear,
  isLoading = false,
  autoFocus = false,
  lang,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isComposing = useRef(false)
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  return (
    <div className="relative flex items-center">
      <SearchIcon className="absolute left-3 w-4 h-4 pointer-events-none" style={{ color: tc.primary + '99' }} />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onCompositionStart={() => { isComposing.current = true }}
        onCompositionEnd={(e) => {
          isComposing.current = false
          onChange(filterByLang(e.currentTarget.value, lang))
        }}
        onChange={(e) => {
          onChange(filterByLang(e.target.value, lang))
        }}
        placeholder="검색 (초성 가능: ㅎㄴ님→하나님)..."
        className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white transition-colors placeholder-gray-400"
        style={{ backgroundColor: tc.light }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = '#fff'
          e.currentTarget.style.boxShadow = `0 0 0 2px ${tc.primary}4d`
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = tc.light
          e.currentTarget.style.boxShadow = ''
        }}
      />

      {isLoading && (
        <div className="absolute right-3">
          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: tc.primary + '40', borderTopColor: tc.primary }} />
        </div>
      )}

      {!isLoading && value && (
        <button
          onClick={onClear}
          className="absolute right-3 p-0.5"
          style={{ color: tc.primary + '99' }}
          aria-label="검색어 지우기"
        >
          <XCircleIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function SearchIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  )
}
