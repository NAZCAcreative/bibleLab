'use client'
// Design Ref: §4.1 — GET /api/bible/[bookId]/[chapter] 클라이언트 훅
import { useState, useEffect } from 'react'

interface Verse {
  id: string
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

interface ChapterData {
  book: { id: number; nameKo: string; nameEn: string; nameAbbr: string; totalChapters: number }
  chapter: number
  verses: Verse[]
}

interface UseChapterResult {
  data: ChapterData | null
  isLoading: boolean
  error: string | null
}

export function useChapter(bookId: number, chapter: number): UseChapterResult {
  const [data, setData] = useState<ChapterData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch(`/api/bible/${bookId}/${chapter}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.data) {
          setData(json.data)
        } else {
          setError(json.error ?? '데이터를 불러오지 못했습니다.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('네트워크 오류가 발생했습니다.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [bookId, chapter])

  return { data, isLoading, error }
}
