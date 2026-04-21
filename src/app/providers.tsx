'use client'
import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { useUserSettings } from '@/presentation/hooks/useUserSettings'
import { useBibleStore } from '@/store/bibleStore'
import { PWAInstallBanner } from '@/presentation/components/layout/PWAInstallBanner'

function SettingsSync() {
  useUserSettings()
  // skipHydration: true 이므로 클라이언트 마운트 후 localStorage에서 수동 복원
  useEffect(() => {
    useBibleStore.persist.rehydrate()
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SettingsSync />
      {children}
      <PWAInstallBanner />
    </SessionProvider>
  )
}
