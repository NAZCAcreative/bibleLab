// Design Ref: §4.1 — GET /api/qt (묵상 노트 목록)
import { ok, unauthorized } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { PrismaQTNoteRepository } from '@/infrastructure/db/prisma/PrismaQTNoteRepository'

const qtRepo = new PrismaQTNoteRepository()

export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const notes = await qtRepo.getAll(session.user.id)
  return ok(notes)
}
