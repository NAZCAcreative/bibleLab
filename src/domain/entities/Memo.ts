// Design Ref: §3.1 — Memo 엔티티
export interface Memo {
  id: string
  userId: string
  verseId: string
  content: string
  createdAt: Date
  updatedAt: Date
}
