// Design Ref: §3.1 — ReadingProgress 엔티티
// Plan SC: FR-08 — 1독 진행률 (읽은 장 기록)
export interface ReadingProgress {
  id: string
  userId: string
  bookId: number
  chapter: number
  readAt: Date
}

// 진행률 집계 결과 (Application 레이어에서 계산 후 반환)
export interface ProgressSummary {
  percentage: number          // 0-100 소수점 1자리
  totalChapters: number       // 1189
  readChapters: number
  byBook: BookProgress[]
  readDates: string[]         // YYYY-MM-DD 형식 (CalendarView용)
}

export interface BookProgress {
  bookId: number
  nameKo: string
  nameEn: string
  totalChapters: number
  readChapters: number
  completed: boolean
}
