// Design Ref: §9.1 Application — 묵상 노트 저장 유스케이스
import type { IQTNoteRepository } from '@/domain/repositories/IQTNoteRepository'
import type { QTNote } from '@/domain/entities/QTNote'

export interface UpsertQTNoteInput {
  userId: string
  date: Date
  verseRef?: string
  content: string
}

export class UpsertQTNoteUseCase {
  constructor(private readonly qtRepo: IQTNoteRepository) {}

  async execute(input: UpsertQTNoteInput): Promise<QTNote> {
    if (!input.content.trim()) {
      throw new Error('묵상 내용을 입력해주세요.')
    }
    return this.qtRepo.upsert(input)
  }
}
