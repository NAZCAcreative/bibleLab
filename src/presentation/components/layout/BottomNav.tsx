'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBibleStore, THEMES } from '@/store/bibleStore'

const ALL_NAV = [
  { href: '/search',     base: '/search',    label: '검색',    icon: SearchIcon,   key: 'search'    },
  { href: '/progress',   base: '/progress',  label: '통독기록', icon: CalendarIcon, key: 'progress'  },
  { href: '/community',  base: '/community', label: '게시판',  icon: ChatIcon,     key: 'community' },
  { href: '/profile',    base: '/profile',   label: '내 페이지', icon: UserIcon,   key: 'profile'   },
]

export function BottomNav() {
  const pathname = usePathname()
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]
  const readingHistory = useBibleStore((s) => s.readingHistory)
  const [navVisibility, setNavVisibility] = useState<Record<string, boolean>>({ community: true })

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { if (d?.data?.navVisibility) setNavVisibility(d.data.navVisibility) })
      .catch(() => {})
  }, [])

  const visibleNav = ALL_NAV.filter((item) => navVisibility[item.key] !== false)

  const bibleHref = readingHistory.length > 0
    ? `/bible/${readingHistory[0].bookId}/${readingHistory[0].chapter}`
    : '/bible/1/1'
  const bibleActive = pathname.startsWith('/bible')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-100 safe-area-pb">
      <div className="flex h-20">
        {/* 성경 버튼 — 마지막 읽은 위치로 */}
        <Link href={bibleHref}
          className="flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors active:opacity-70">
          <div className="flex items-center justify-center w-12 h-8 rounded-2xl transition-all"
            style={bibleActive ? { backgroundColor: tc.primary + '18' } : undefined}>
            <BookIcon className={`w-6 h-6 transition-colors ${!bibleActive ? 'text-stone-400' : ''}`}
              style={bibleActive ? { color: tc.primary } : undefined} />
          </div>
          <span className={`text-xs font-semibold transition-colors leading-none ${!bibleActive ? 'text-stone-400' : ''}`}
            style={bibleActive ? { color: tc.primary } : undefined}>
            성경
          </span>
        </Link>

        {visibleNav.map((item) => {
          const active = pathname.startsWith(item.base)
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors active:opacity-70">
              <div className="flex items-center justify-center w-12 h-8 rounded-2xl transition-all"
                style={active ? { backgroundColor: tc.primary + '18' } : undefined}>
                <item.icon className={`w-6 h-6 transition-colors ${!active ? 'text-stone-400' : ''}`}
                  style={active ? { color: tc.primary } : undefined} />
              </div>
              <span className={`text-xs font-semibold transition-colors leading-none ${!active ? 'text-stone-400' : ''}`}
                style={active ? { color: tc.primary } : undefined}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

type IconProps = { className?: string; style?: React.CSSProperties }

function BookIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
}
function SearchIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
}
function CalendarIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
}
function ChatIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
}
function UserIcon({ className, style }: IconProps) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
}
