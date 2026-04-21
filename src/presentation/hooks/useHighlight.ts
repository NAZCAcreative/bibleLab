'use client'
// Design Ref: §4.1 — GET/POST/DELETE /api/highlight 클라이언트 훅
import { useState, useEffect, useCallback } from 'react'
import type { HighlightColor } from '@/domain/value-objects/HighlightColor'

interface Highlight {
  id: string
  verseId: string
  color: HighlightColor
}

export function useHighlight(_bookId: number, _chapter: number) {
  const [highlights, setHighlights] = useState<Map<string, Highlight>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetch(`/api/highlights`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.data) return
        const map = new Map<string, Highlight>()
        for (const h of json.data as Highlight[]) {
          map.set(h.verseId, h)
        }
        setHighlights(map)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [])

  const upsert = useCallback(async (verseId: string, color: HighlightColor) => {
    const res = await fetch('/api/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verseId, color }),
    })
    const json = await res.json()
    if (json.data) {
      setHighlights((prev) => new Map(prev).set(verseId, json.data))
    }
  }, [])

  const remove = useCallback(async (verseId: string) => {
    const highlight = highlights.get(verseId)
    if (!highlight) return
    await fetch(`/api/highlights/${highlight.id}`, { method: 'DELETE' })
    setHighlights((prev) => {
      const next = new Map(prev)
      next.delete(verseId)
      return next
    })
  }, [highlights])

  return { highlights, isLoading, upsert, remove }
}
