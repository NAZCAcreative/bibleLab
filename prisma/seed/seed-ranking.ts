/**
 * 통독 순위 더미 데이터 — 100명의 테스트 유저 + 구절 읽기 기록 생성
 * 사용법: npx tsx prisma/seed/seed-ranking.ts
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const CHURCHES = [
  '새문안교회', '온누리교회', '사랑의교회', '여의도순복음교회', '명성교회',
  '소망교회', '충현교회', '영락교회', '광림교회', '강남교회',
  '분당우리교회', '지구촌교회', '행복한교회', '빛과소금교회', '새생명교회',
  null, null, null,
]

const NAMES = [
  '김성경', '이통독', '박말씀', '최믿음', '정소망', '한사랑', '오은혜', '류평화', '서기쁨', '장감사',
  '윤찬양', '임기도', '강복음', '고진리', '신생명', '백빛나', '유하나', '문마리', '손요한', '양베드로',
  '조야고보', '권안드레', '나도마', '마빌립', '심바돌', '염마태', '엄시몬', '변가롯', '도나다나', '탁바나바',
  '길브루노', '남아굴라', '라브리스', '제바울로', '표디모데', '우디도', '진에바', '석루디아', '목프리스', '봉막달라',
  '기수산나', '노요안나', '태살로메', '방엘리사', '배드보라', '함한나', '하미리암', '곽아비가', '안밧세바', '차라합',
  '류에스더', '어룻기', '오사라', '두리브가', '소레아', '부라헬', '주빌하', '민질바', '저레아', '교드보라',
  '경드라', '가브리엘', '하란', '므낫세', '에브라임', '르우벤', '시므온', '레위', '유다', '잇사갈',
  '스불론', '단', '납달리', '갓', '아셀', '베냐민', '요셉', '디나', '아브람', '나홀',
  '하란남', '데라', '셈', '함', '야벳', '에녹', '므두셀라', '라멕', '노아', '셋',
  '아담', '하와', '가인', '아벨', '에노스', '게난', '마할랄렐', '야렛', '므두사', '에녹빛',
]

const TOTAL_VERSES = 31102

async function main() {
  console.log('🌱 통독 순위 더미 데이터 생성 시작...')

  // 기존 더미 유저 삭제 (email이 dummy-로 시작하는 유저)
  const deleted = await prisma.user.deleteMany({
    where: { email: { startsWith: 'dummy-rank-' } },
  })
  console.log(`🗑️  기존 더미 유저 ${deleted.count}명 삭제`)

  // 모든 verseId 조회 (랜덤 샘플링용)
  const allVerses = await prisma.verse.findMany({ select: { id: true }, orderBy: { id: 'asc' } })
  console.log(`📖 전체 구절 수: ${allVerses.length}`)

  const hashedPw = await bcrypt.hash('dummy1234', 10)

  for (let i = 0; i < 100; i++) {
    const name = NAMES[i] ?? `테스트유저${i + 1}`
    const church = CHURCHES[i % CHURCHES.length]
    const email = `dummy-rank-${String(i + 1).padStart(3, '0')}@test.com`

    // 읽은 구절 수 분포: 상위일수록 많이 읽음
    // i=0 → ~31102절(완독), i=99 → ~500절
    const rank = i + 1
    let verseCount: number
    let prestige = 0
    if (rank <= 3) {
      // 상위 3명: 전승자 (완독 후 prestige)
      prestige = 3 - (rank - 1)
      verseCount = Math.floor(TOTAL_VERSES * (0.6 + Math.random() * 0.4))
    } else if (rank <= 10) {
      verseCount = Math.floor(TOTAL_VERSES * (0.7 + Math.random() * 0.3))
    } else if (rank <= 20) {
      verseCount = Math.floor(TOTAL_VERSES * (0.4 + Math.random() * 0.3))
    } else if (rank <= 40) {
      verseCount = Math.floor(TOTAL_VERSES * (0.2 + Math.random() * 0.2))
    } else if (rank <= 70) {
      verseCount = Math.floor(TOTAL_VERSES * (0.05 + Math.random() * 0.15))
    } else {
      verseCount = Math.floor(500 + Math.random() * 3000)
    }

    verseCount = Math.min(verseCount, allVerses.length)

    // 유저 생성
    const user = await prisma.user.create({
      data: { email, name, church, password: hashedPw, prestige, agreedToTerms: true },
    })

    // 랜덤 구절 샘플링 (Fisher-Yates partial shuffle)
    const shuffled = [...allVerses]
    for (let j = 0; j < verseCount; j++) {
      const k = j + Math.floor(Math.random() * (shuffled.length - j))
      ;[shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]]
    }
    const selected = shuffled.slice(0, verseCount)

    // VerseRead bulk insert (배치 500개씩)
    const BATCH = 500
    for (let b = 0; b < selected.length; b += BATCH) {
      await prisma.verseRead.createMany({
        data: selected.slice(b, b + BATCH).map((v) => ({
          userId: user.id,
          verseId: v.id,
          readAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        })),
        skipDuplicates: true,
      })
    }

    console.log(`✅ [${String(rank).padStart(3)}] ${name} — ${verseCount.toLocaleString()}절 (전승 ${prestige})`)
  }

  console.log('\n🎉 더미 데이터 생성 완료!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
