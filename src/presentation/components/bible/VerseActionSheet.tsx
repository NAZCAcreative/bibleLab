'use client'
// Design Ref: §5.4 — 절 선택 후 액션 시트 (하이라이트, 메모, 공유)
import { HIGHLIGHT_COLORS, HIGHLIGHT_COLOR_VALUES, type HighlightColor } from '@/domain/value-objects/HighlightColor'

interface VerseActionSheetProps {
  verseRef: string
  verseId: string
  currentColor?: HighlightColor
  hasHighlight: boolean
  onHighlight: (color: HighlightColor) => void
  onRemoveHighlight: () => void
  onMemo: () => void
  onClose: () => void
}

export function VerseActionSheet({
  verseRef,
  verseId: _verseId,
  currentColor,
  hasHighlight,
  onHighlight,
  onRemoveHighlight,
  onMemo,
  onClose,
}: VerseActionSheetProps) {
  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* 시트 */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* 절 참조 */}
        <p className="text-center text-xs font-medium text-indigo-400 pb-4 tracking-wide">
          {verseRef}
        </p>

        {/* 하이라이트 색상 */}
        <div className="flex items-center justify-center gap-5 px-6 pb-5">
          {HIGHLIGHT_COLOR_VALUES.map((color) => (
            <button
              key={color}
              onClick={() => onHighlight(color)}
              className={`w-9 h-9 rounded-full ${HIGHLIGHT_COLORS[color].bg} transition-all active:scale-90 shadow-sm ${
                currentColor === color
                  ? 'ring-2 ring-offset-2 ring-stone-400 scale-110'
                  : 'hover:scale-110'
              }`}
              aria-label={HIGHLIGHT_COLORS[color].label}
            />
          ))}
          {hasHighlight && (
            <button
              onClick={onRemoveHighlight}
              className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center active:bg-stone-200 transition-colors"
              aria-label="하이라이트 제거"
            >
              <XIcon className="w-4 h-4 text-stone-400" />
            </button>
          )}
        </div>

        {/* 구분선 */}
        <div className="h-px bg-stone-100 mx-4" />

        {/* 액션 버튼 */}
        <button
          onClick={onMemo}
          className="flex items-center gap-3 w-full px-6 py-4 text-left active:bg-stone-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <PencilIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">묵상 노트</p>
            <p className="text-xs text-stone-400">이 구절로 묵상 기록 작성</p>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-stone-300 ml-auto" />
        </button>

        <div className="pb-safe h-2" />
      </div>
    </>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
