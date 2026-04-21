// Design Ref: §2.1 — PWA 레이아웃: SW 등록 + 매니페스트 링크
// 폰트: public/fonts/ 로컬 파일 (scripts/download-fonts.mjs 로 생성)
import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: '성경 읽기 | BibleLab',
  description: '모바일 우선 PWA 성경 플랫폼 — KJV + 한국어 병행, 1독 진행률, 묵상 기록',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'BibleLab' },
  other: { 'mobile-web-app-capable': 'yes' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f4f0',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 로컬 폰트 CSS — 구글 폰트 CDN 불필요 */}
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body className="bg-stone-50 text-stone-900 antialiased font-sans">
        <Providers>{children}</Providers>
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
        }} />
      </body>
    </html>
  )
}
