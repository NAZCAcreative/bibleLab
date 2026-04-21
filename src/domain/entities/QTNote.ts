// Design Ref: §3.1 — QTNote 엔티티 (묵상/큐티 노트)
export interface QTNote {
  id: string
  userId: string
  date: Date
  verseRef: string | null   // 예: "요 3:16"
  content: string
  createdAt: Date
  updatedAt: Date
}
