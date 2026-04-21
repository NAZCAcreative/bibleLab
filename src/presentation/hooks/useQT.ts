'use client'
// Design Ref: §4.1 — GET/PUT/DELETE /api/qt/[date] 클라이언트 훅
import { useState, useEffect, useCallback } from 'react'

interface QTNote {
  id: string
  date: string
  verseRef: string | null
  content: string
  createdAt: string
  updatedAt: string
}

interface UseQTResult {
  note: QTNote | null
  isLoading: boolean
  isSaving: boolean
  save: (content: string, verseRef?: string) => Promise<void>
  remove: () => Promise<void>
}

export function useQT(date: string): UseQTResult {
  const [note, setNote] = useState<QTNote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetch(`/api/qt/${date}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        setNote(json.data ?? null)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [date])

  const save = useCallback(async (content: string, verseRef?: string) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/qt/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, verseRef }),
      })
      const json = await res.json()
      if (json.data) setNote(json.data)
    } finally {
      setIsSaving(false)
    }
  }, [date])

  const remove = useCallback(async () => {
    if (!note) return
    await fetch(`/api/qt/${date}`, { method: 'DELETE' })
    setNote(null)
  }, [date, note])

  return { note, isLoading, isSaving, save, remove }
}

// 전체 노트 목록 훅
interface UseQTListResult {
  notes: QTNote[]
  isLoading: boolean
}

export function useQTList(): UseQTListResult {
  const [notes, setNotes] = useState<QTNote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/qt')
      .then((res) => res.json())
      .then((json) => { if (json.data) setNotes(json.data) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return { notes, isLoading }
}
