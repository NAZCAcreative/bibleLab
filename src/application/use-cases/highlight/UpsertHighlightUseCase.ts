// Design Ref: §9.1 Application — 하이라이트 저장/변경 유스케이스
import type { IHighlightRepository } from '@/domain/repositories/IHighlightRepository'
import type { Highlight } from '@/domain/entities/Highlight'
import { isValidHighlightColor, type HighlightColor } from '@/domain/value-objects/HighlightColor'

export interface UpsertHighlightInput {
  userId: string
  verseId: string
  color: string
}

export class UpsertHighlightUseCase {
  constructor(private readonly highlightRepo: IHighlightRepository) {}

  async execute(input: UpsertHighlightInput): Promise<Highlight> {
    if (!isValidHighlightColor(input.color)) {
      throw new Error(`유효하지 않은 색상: ${input.color}`)
    }
    return this.highlightRepo.upsert({
      userId: input.userId,
      verseId: input.verseId,
      color: input.color as HighlightColor,
    })
  }
}
