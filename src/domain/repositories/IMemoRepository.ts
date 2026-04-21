// Design Ref: §3.3 — Memo Repository 인터페이스
import type { Memo } from '../entities/Memo'

export interface IMemoRepository {
  getByVerse(userId: string, verseId: string): Promise<Memo | null>
  upsert(data: { userId: string; verseId: string; content: string }): Promise<Memo>
  delete(id: string, userId: string): Promise<void>
}
