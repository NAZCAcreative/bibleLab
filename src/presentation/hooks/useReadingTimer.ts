'use client'
import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

// 챕터 입장 시 읽기 시간을 측정하고, 페이지 이탈 시 서버에 기록
export function useReadingTimer(bookId: number, chapter: number) {
  const { status } = useSession()
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    if (status !== 'authenticated') return
    startRef.current = Date.now()

    const send = () => {
      const duration = Math.round((Date.now() - startRef.current) / 1000)
      if (duration < 5) return
      const payload = JSON.stringify({ bookId, chapter, duration })
      fetch('/api/reading-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }

    window.addEventListener('beforeunload', send)
    return () => {
      window.removeEventListener('beforeunload', send)
      send() // 라우트 이동 시에도 기록
    }
  }, [bookId, chapter, status])
}
