// Design Ref: §3.1 — Highlight 엔티티
import type { HighlightColor } from '../value-objects/HighlightColor'

export interface Highlight {
  id: string
  userId: string
  verseId: string
  color: HighlightColor
  createdAt: Date
}
