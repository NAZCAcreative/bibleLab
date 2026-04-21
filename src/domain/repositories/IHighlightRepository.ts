// Design Ref: §3.3 — Highlight Repository 인터페이스
import type { Highlight } from '../entities/Highlight'
import type { HighlightColor } from '../value-objects/HighlightColor'

export interface IHighlightRepository {
  getByUser(userId: string): Promise<Highlight[]>
  getByVerse(userId: string, verseId: string): Promise<Highlight | null>
  upsert(data: { userId: string; verseId: string; color: HighlightColor }): Promise<Highlight>
  delete(id: string, userId: string): Promise<void>
}
