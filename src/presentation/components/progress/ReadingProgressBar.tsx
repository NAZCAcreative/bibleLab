// Design Ref: §5.5 — 1독 진행률 바 컴포넌트
interface ReadingProgressBarProps {
  percentage: number    // 0–100, 소수점 1자리
  readChapters: number
  totalChapters: number
}

export function ReadingProgressBar({
  percentage,
  readChapters,
  totalChapters,
}: ReadingProgressBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">1독 진행률</p>
          <p className="text-3xl font-bold text-blue-600">
            {percentage}
            <span className="text-lg font-normal text-gray-400">%</span>
          </p>
        </div>
        <p className="text-sm text-gray-400 pb-1">
          {readChapters} / {totalChapters}장
        </p>
      </div>

      {/* 프로그레스 바 */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
