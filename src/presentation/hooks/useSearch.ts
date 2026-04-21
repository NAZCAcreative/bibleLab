'use client'
// Design Ref: §4.1 — GET /api/bible/search 클라이언트 훅
import { useState, useCallback, useRef } from 'react'

export interface SearchVerse {
  id: string
  bookId: number
  chapter: number
  verse: number
  textEn: string
  textKo: string | null
  book: {
    id: number
    nameKo: string
    nameEn: string
    nameAbbr: string
  }
}

interface UseSearchResult {
  results: SearchVerse[]
  isLoading: boolean
  error: string | null
  search: (query: string, lang?: string) => void
  clear: () => void
  query: string
}

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<SearchVerse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((q: string, lang = 'ko') => {
    setQuery(q)
    if (!q.trim()) {
      setResults([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
    // 이전 요청 취소
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    fetch(`/api/bible/search?q=${encodeURIComponent(q)}&lang=${lang}`, {
      signal: abortRef.current.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setResults(json.data)
        } else if (json.error) {
          setError(json.error.message ?? '검색 중 오류가 발생했습니다.')
          setResults([])
        }
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name !== 'AbortError') {
          setError('네트워크 오류가 발생했습니다.')
        }
      })
      .finally(() => setIsLoading(false))
    }, 300)
  }, [])

  const clear = useCallback(() => {
    abortRef.current?.abort()
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  return { results, isLoading, error, search, clear, query }
}
