'use client'
import { useRef } from 'react'
import { getNoteColor } from '@/lib/noteColors'
import { useBibleStore, FONT_FAMILY_CLASS, LINE_HEIGHT_CLASS, VERSE_SPACING_CLASS, THEMES } from '@/store/bibleStore'

interface VerseItemProps {
  id: string
  verse: number
  text: string
  isRead?: boolean
  isSelected?: boolean
  noteColor?: string
  isHighlighted?: boolean
  onRead: (verseId: string) => void
  onNote: (verseId: string) => void
}

export function VerseItem({ id, verse, text, isRead, isSelected, noteColor, isHighlighted, onRead, onNote }: VerseItemProps) {
  const fontFamily = useBibleStore((s) => s.fontFamily)
  const fontBold = useBibleStore((s) => s.fontBold)
  const lineHeight = useBibleStore((s) => s.lineHeight)
  const verseSpacing = useBibleStore((s) => s.verseSpacing)
  const theme = useBibleStore((s) => s.theme)
  const fontClass = FONT_FAMILY_CLASS[fontFamily] ?? 'font-noto-sans-kr'
  const lhClass = LINE_HEIGHT_CLASS[lineHeight] ?? 'leading-relaxed'
  const spacingClass = VERSE_SPACING_CLASS[verseSpacing] ?? 'py-3'
  const noteColorObj = noteColor ? getNoteColor(noteColor) : null
  const tc = THEMES[theme]

  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = () => {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current)
      tapTimer.current = null
      onNote(id)
    } else {
      tapTimer.current = setTimeout(() => {
        tapTimer.current = null
        onRead(id)
      }, 280)
    }
  }

  const containerStyle = isSelected
    ? { backgroundColor: tc.light, borderLeftColor: tc.primary }
    : noteColorObj
      ? { backgroundColor: noteColorObj.bg + '88', borderLeftColor: noteColorObj.bg }
      : isRead
        ? { backgroundColor: tc.light + 'cc', borderLeftColor: tc.primary + '99' }
        : { borderLeftColor: 'transparent' }

  return (
    <button
      id={`verse-${verse}`}
      onClick={handleClick}
      className={`w-full text-left px-4 ${spacingClass} transition-all active:opacity-60 border-l-4${isHighlighted ? ' animate-verse-flash' : ''}`}
      style={containerStyle}
    >
      <span className="inline-flex items-start justify-start gap-2.5">
        <span
          className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold leading-none"
          style={isRead
            ? { backgroundColor: tc.primary, color: '#fff' }
            : { backgroundColor: tc.primary + '1a', color: tc.primary + 'b3' }}
        >
          {isRead ? '✓' : verse}
        </span>
        <span
          className={`${lhClass} ${fontClass} ${fontBold ? 'font-bold' : 'font-normal'}`}
          style={{ color: isRead ? tc.primary + 'dd' : '#1c1917' }}
        >{text}</span>
      </span>
    </button>
  )
}
