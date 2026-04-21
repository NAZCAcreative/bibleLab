// Design Ref: §5.5 — 월별 달력 (읽은 날 색상 표시)
interface CalendarViewProps {
  readDates: string[]   // YYYY-MM-DD 형식
}

export function CalendarView({ readDates }: CalendarViewProps) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  // 이번 달에 읽은 날짜 집합 (day number)
  const readDaySet = new Set(
    readDates
      .filter((d) => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
      .map((d) => parseInt(d.slice(8, 10), 10))
  )

  // 달력 그리드 계산
  const firstDay = new Date(year, month, 1).getDay()  // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthLabel = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">{monthLabel}</h3>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {dayLabels.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs py-1 font-medium ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />
          const isToday = day === today.getDate()
          const isRead = readDaySet.has(day)
          const isSun = idx % 7 === 0
          const isSat = idx % 7 === 6
          return (
            <div key={idx} className="flex items-center justify-center py-0.5">
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${
                  isToday
                    ? 'bg-blue-600 text-white'
                    : isRead
                    ? 'bg-blue-100 text-blue-700'
                    : isSun
                    ? 'text-red-400'
                    : isSat
                    ? 'text-blue-400'
                    : 'text-gray-700'
                }`}
              >
                {day}
              </span>
            </div>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-3 mt-3 justify-center">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-blue-100 inline-block" />
          읽은 날
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          오늘
        </span>
      </div>
    </div>
  )
}
