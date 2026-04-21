'use client'
// Design Ref: §5.7 — QT 묵상 노트 목록 (달력 + 최근 노트)
import { useQTList } from '@/presentation/hooks/useQT'

interface QTListProps {
  onSelectDate: (date: string) => void
  selectedDate: string
}

export function QTList({ onSelectDate, selectedDate }: QTListProps) {
  const { notes, isLoading } = useQTList()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
        불러오는 중...
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        아직 작성된 묵상이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {notes.map((note) => {
        const dateStr = typeof note.date === 'string'
          ? note.date.slice(0, 10)
          : new Date(note.date).toISOString().slice(0, 10)
        const isSelected = dateStr === selectedDate

        return (
          <button
            key={note.id}
            onClick={() => onSelectDate(dateStr)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
              isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-600 mb-1">
                  {formatDate(dateStr)}
                  {note.verseRef && (
                    <span className="ml-2 text-gray-400 font-normal">{note.verseRef}</span>
                  )}
                </p>
                <p className="text-sm text-gray-700 line-clamp-2">{note.content}</p>
              </div>
              <span className="text-xs text-gray-300 flex-shrink-0 pt-0.5">
                {formatTime(note.updatedAt)}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short',
  })
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  })
}
