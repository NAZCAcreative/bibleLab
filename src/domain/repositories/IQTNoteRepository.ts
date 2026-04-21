// Design Ref: §3.3 — QTNote Repository 인터페이스
import type { QTNote } from '../entities/QTNote'

export interface IQTNoteRepository {
  getByDate(userId: string, date: Date): Promise<QTNote | null>
  getAll(userId: string): Promise<QTNote[]>
  upsert(data: { userId: string; date: Date; verseRef?: string; content: string }): Promise<QTNote>
  delete(id: string, userId: string): Promise<void>
}
