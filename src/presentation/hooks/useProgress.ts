'use client'
// Design Ref: §4.1 — GET /api/progress 클라이언트 훅
import { useState, useEffect, useCallback } from 'react'
import type { ProgressSummary } from '@/domain/entities/ReadingProgress'

interface UseProgressResult {
  data: ProgressSummary | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProgress(): UseProgressResult {
  const [data, setData] = useState<ProgressSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch('/api/progress')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.data) {
          setData(json.data)
        } else if (json.error) {
          setError(json.error.message ?? '진행률을 불러오지 못했습니다.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('네트워크 오류가 발생했습니다.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { data, isLoading, error, refetch }
}
