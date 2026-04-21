// Design Ref: §4.1 — GET /api/bible/books (66권 목록)
import { ok } from '@/lib/api-response'
import { BOOKS } from '@/domain/value-objects/BookName'

export async function GET() {
  return ok(BOOKS)
}
