'use client'
import Link from 'next/link'
import { useBibleStore, THEMES } from '@/store/bibleStore'

interface SearchResultItemProps {
  id: string
  bookId: number
  bookNameKo: string
  chapter: number
  verse: number
  text: string
  query: string
}

export function SearchResultItem({
  bookId,
  bookNameKo,
  chapter,
  verse,
  text,
  query,
}: SearchResultItemProps) {
  const theme = useBibleStore((s) => s.theme)
  const tc = THEMES[theme]
  const href = `/bible/${bookId}/${chapter}?verse=${verse}`

  return (
    <Link
      href={href}
      className="block px-4 py-3 hover:bg-gray-50 transition-colors active:bg-gray-100"
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-xs font-semibold" style={{ color: tc.primary }}>
          {bookNameKo} {chapter}:{verse}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
        <HighlightedText text={text} query={query} />
      </p>
    </Link>
  )
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
