import { NextRequest } from 'next/server'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api-response'
import { requireAuth } from '@/lib/get-session'
import { prisma } from '@/infrastructure/db/client'

// PATCH /api/admin/settings  body: { key: 'bible_lang_visibility', value: { ko, en, narrative, message } }
export async function PATCH(req: NextRequest) {
  const session = await requireAuth()
  if (!session || session.user.role !== 'admin') return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.key || body.value === undefined) return badRequest('key와 value가 필요합니다.')

  const ALLOWED_KEYS = ['bible_lang_visibility', 'nav_visibility']
  if (!ALLOWED_KEYS.includes(body.key)) return badRequest('허용되지 않는 설정 키입니다.')

  try {
    await prisma.appSetting.upsert({
      where: { key: body.key },
      update: { value: JSON.stringify(body.value), updatedBy: session.user.id },
      create: { key: body.key, value: JSON.stringify(body.value), updatedBy: session.user.id },
    })
    return ok({ updated: true })
  } catch (e) {
    console.error('[admin settings PATCH]', e)
    return serverError()
  }
}
