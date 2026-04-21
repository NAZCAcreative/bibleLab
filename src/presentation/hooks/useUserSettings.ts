'use client'
import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useBibleStore, type FontFamily, type FontSize, FONT_FAMILY_CLASS } from '@/store/bibleStore'

// 로그인 시 서버 설정을 로드하고, 변경 시 서버에 동기화
export function useUserSettings() {
  const { data: session, status } = useSession()
  const { fontFamily, fontSize, setFontFamily, setFontSize } = useBibleStore()
  const initialized = useRef(false)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 로그인 시 서버 설정 로드 (1회)
  useEffect(() => {
    if (status !== 'authenticated' || initialized.current) return
    initialized.current = true

    fetch('/api/user/settings')
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.fontFamily && data.fontFamily in FONT_FAMILY_CLASS) {
          setFontFamily(data.fontFamily as FontFamily)
        }
        if (data?.fontSize) {
          setFontSize(data.fontSize as FontSize)
        }
      })
      .catch(() => {})
  }, [status, setFontFamily, setFontSize])

  // 폰트/사이즈 변경 시 서버 동기화 (debounce 1.5s)
  useEffect(() => {
    if (status !== 'authenticated') return
    if (!initialized.current) return

    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontFamily, fontSize }),
      }).catch(() => {})
    }, 1500)

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current)
    }
  }, [fontFamily, fontSize, status])

  return null
}
