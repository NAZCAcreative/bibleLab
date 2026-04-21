import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BADGES = [
  // Common
  { code: 'first_step',    name: '첫 걸음',      description: '처음으로 성경 한 장을 읽었습니다',   icon: '🌱', rarity: 'common',    sortOrder: 1 },
  { code: 'chapters_10',   name: '10장 독서가',   description: '성경 10개 장을 읽었습니다',         icon: '📖', rarity: 'common',    sortOrder: 2 },
  { code: 'memo_5',        name: '묵상 시작',     description: '묵상 메모를 5개 작성했습니다',      icon: '✍️', rarity: 'common',    sortOrder: 3 },
  { code: 'highlight_10',  name: '말씀 표시',     description: '구절을 10개 이상 형광펜 표시했습니다', icon: '🖍️', rarity: 'common',  sortOrder: 4 },
  // Rare
  { code: 'chapters_50',   name: '50장 독서가',   description: '성경 50개 장을 읽었습니다',         icon: '🔥', rarity: 'rare',      sortOrder: 5 },
  { code: 'streak_7',      name: '7일 연속',      description: '7일 연속으로 성경을 읽었습니다',    icon: '⚡', rarity: 'rare',      sortOrder: 6 },
  { code: 'qt_10',         name: '큐티 10회',     description: 'QT 노트를 10개 작성했습니다',      icon: '🕊️', rarity: 'rare',     sortOrder: 7 },
  { code: 'highlight_50',  name: '말씀 수집가',   description: '구절을 50개 이상 형광펜 표시했습니다', icon: '✨', rarity: 'rare',   sortOrder: 8 },
  { code: 'early_bird',    name: '새벽 독서가',   description: '새벽 5시 이전에 성경을 읽었습니다', icon: '🌅', rarity: 'rare',      sortOrder: 9 },
  // Epic
  { code: 'chapters_150',  name: '150장 독서가',  description: '성경 150개 장을 읽었습니다',        icon: '🏆', rarity: 'epic',      sortOrder: 10 },
  { code: 'streak_30',     name: '30일 연속',     description: '30일 연속으로 성경을 읽었습니다',   icon: '💎', rarity: 'epic',      sortOrder: 11 },
  { code: 'new_testament', name: '신약 완독',     description: '신약성경 27권을 모두 읽었습니다',   icon: '🕊️', rarity: 'epic',     sortOrder: 12 },
  { code: 'qt_50',         name: '큐티 50회',     description: 'QT 노트를 50개 작성했습니다',      icon: '📿', rarity: 'epic',      sortOrder: 13 },
  // Legendary
  { code: 'old_testament', name: '구약 완독',     description: '구약성경 39권을 모두 읽었습니다',   icon: '⚔️', rarity: 'legendary', sortOrder: 14 },
  { code: 'bible_complete','name': '성경 완독',   description: '성경 66권 전체를 완독했습니다',     icon: '👑', rarity: 'legendary', sortOrder: 15 },
  { code: 'streak_100',    name: '100일 연속',    description: '100일 연속으로 성경을 읽었습니다',  icon: '🌟', rarity: 'legendary', sortOrder: 16 },
]

// icon 필드 수정 (중복 name 키 수정)
const CLEAN_BADGES = BADGES.map(b => ({ ...b, name: b.name.replace(/^'name': /, '') }))

export async function seedBadges() {
  for (const badge of CLEAN_BADGES) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      create: badge,
      update: badge,
    })
  }
  console.log(`✅ ${CLEAN_BADGES.length}개 뱃지 시드 완료`)
}

if (require.main === module) {
  seedBadges().then(() => prisma.$disconnect()).catch(console.error)
}
