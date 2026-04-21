'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('pwa-banner-dismissed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'dismissed') localStorage.setItem('pwa-banner-dismissed', '1')
    setPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', '1')
    setDismissed(true)
  }

  if (!prompt || dismissed) return null

  return (
    <div className="fixed bottom-24 left-3 right-3 z-40 bg-white rounded-2xl shadow-2xl border border-stone-100 p-3.5 flex items-center gap-3"
      style={{ animation: 'formIn 0.4s ease-out both' }}>
      <Image src="/images/logo_01.PNG" alt="BibleLab" width={40} height={40}
        className="w-10 h-10 rounded-xl object-contain shrink-0 bg-stone-900 p-1.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-stone-800 leading-tight">홈 화면에 추가</p>
        <p className="text-xs text-stone-400 leading-tight mt-0.5">앱처럼 빠르게 성경을 읽어보세요</p>
      </div>
      <button
        onClick={install}
        className="text-white text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 shadow-sm"
        style={{ backgroundColor: '#1a3d5c' }}
      >
        추가
      </button>
      <button onClick={dismiss} className="text-stone-300 text-lg leading-none shrink-0 -mr-1">×</button>
    </div>
  )
}
