// Design Ref: §5.5 — 66권별 진행률 목록
import type { BookProgress } from '@/domain/entities/ReadingProgress'

interface BookProgressListProps {
  books: BookProgress[]
}

export function BookProgressList({ books }: BookProgressListProps) {
  const ot = books.filter((b) => b.bookId <= 39)
  const nt = books.filter((b) => b.bookId >= 40)

  return (
    <div className="space-y-4">
      <Section title="구약 (39권)" books={ot} />
      <Section title="신약 (27권)" books={nt} />
    </div>
  )
}

function Section({ title, books }: { title: string; books: BookProgress[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 mb-2">
        {title}
      </h3>
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {books.map((book) => {
          const pct = book.totalChapters > 0
            ? Math.round((book.readChapters / book.totalChapters) * 100)
            : 0

          return (
            <div key={book.bookId} className="flex items-center px-4 py-3 gap-3">
              {/* 완독 배지 */}
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  book.completed ? 'bg-blue-500' : book.readChapters > 0 ? 'bg-blue-200' : 'bg-gray-200'
                }`}
              />

              <span className="text-sm text-gray-800 w-16 flex-shrink-0">
                {book.nameKo}
              </span>

              {/* 미니 프로그레스 바 */}
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="text-xs text-gray-400 w-14 text-right flex-shrink-0">
                {book.readChapters}/{book.totalChapters}장
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
