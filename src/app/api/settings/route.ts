import { ok, serverError } from '@/lib/api-response'
import { prisma } from '@/infrastructure/db/client'

const DEFAULT_LANG_VISIBILITY = { ko: true, en: true, narrative: true, easy: true }
const DEFAULT_NAV_VISIBILITY = { community: true }

// GET /api/settings  → { bibleLangVisibility, navVisibility }
export async function GET() {
  try {
    const [langRow, navRow] = await Promise.all([
      prisma.appSetting.findUnique({ where: { key: 'bible_lang_visibility' } }),
      prisma.appSetting.findUnique({ where: { key: 'nav_visibility' } }),
    ])
    const bibleLangVisibility = { ...DEFAULT_LANG_VISIBILITY, ...(langRow ? JSON.parse(langRow.value) : {}) }
    const navVisibility = { ...DEFAULT_NAV_VISIBILITY, ...(navRow ? JSON.parse(navRow.value) : {}) }
    return ok({ bibleLangVisibility, navVisibility })
  } catch (e) {
    console.error('[settings GET]', e)
    return ok({ bibleLangVisibility: DEFAULT_LANG_VISIBILITY, navVisibility: DEFAULT_NAV_VISIBILITY })
  }
}
