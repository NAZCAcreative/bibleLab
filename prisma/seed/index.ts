/**
 * Design Ref: §3.4 — 성경 데이터 시드 스크립트
 * Plan SC: FR-01, FR-13 — KJV(공개 도메인) + 한국어 번역 데이터 import
 *
 * 데이터 소스:
 *   KJV: https://github.com/scrollmapper/bible_databases (public domain)
 *   KO:  AI 번역 또는 공개 도메인 한국어 번역본
 *
 * 사용법:
 *   1. KJV JSON 다운로드: npx tsx prisma/seed/download.ts
 *   2. 시드 실행: pnpm db:seed
 */

import { PrismaClient } from '@prisma/client'
import { BOOKS } from '../../src/domain/value-objects/BookName'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

// KJV JSON 형식 (scrollmapper/bible_databases)
interface KJVVerse {
  b: number   // book (1-66)
  c: number   // chapter
  v: number   // verse
  t: string   // text
}

// 한국어 번역 JSON 형식 (동일 구조)
interface KOVerse {
  b: number
  c: number
  v: number
  t: string
}

async function seedBooks() {
  console.log('📚 Seeding books (66권)...')
  for (const book of BOOKS) {
    await prisma.book.upsert({
      where: { id: book.id },
      update: {
        nameEn: book.nameEn,
        nameKo: book.nameKo,
        nameAbbr: book.nameAbbr,
        testament: book.testament,
        totalChapters: book.totalChapters,
      },
      create: {
        id: book.id,
        nameEn: book.nameEn,
        nameKo: book.nameKo,
        nameAbbr: book.nameAbbr,
        testament: book.testament,
        totalChapters: book.totalChapters,
      },
    })
  }
  console.log('✅ Books seeded: 66권')
}

async function seedVerses() {
  const kjvPath = join(__dirname, 'kjv.json')
  const koPath = join(__dirname, 'ko.json')

  if (!existsSync(kjvPath)) {
    console.warn('⚠️  KJV 데이터 파일이 없습니다: prisma/seed/kjv.json')
    console.warn('   다운로드: npx tsx prisma/seed/download.ts')
    console.warn('   또는 수동으로 kjv.json 파일을 prisma/seed/ 에 넣어주세요.')
    return
  }

  console.log('📖 Loading KJV data...')
  const kjvData: KJVVerse[] = JSON.parse(readFileSync(kjvPath, 'utf-8'))

  // 한국어 데이터 (없으면 KJV 원문으로 fallback)
  const koMap = new Map<string, string>()
  if (existsSync(koPath)) {
    console.log('🇰🇷 Loading Korean translation data...')
    const koData: KOVerse[] = JSON.parse(readFileSync(koPath, 'utf-8'))
    for (const v of koData) {
      koMap.set(`${v.b}-${v.c}-${v.v}`, v.t)
    }
  } else {
    console.warn('⚠️  한국어 번역 파일 없음 (prisma/seed/ko.json). KJV 원문으로 대체.')
  }

  console.log(`📝 Seeding ${kjvData.length} verses...`)

  // 배치 처리 (1000개씩)
  const BATCH_SIZE = 1000
  let inserted = 0

  for (let i = 0; i < kjvData.length; i += BATCH_SIZE) {
    const batch = kjvData.slice(i, i + BATCH_SIZE)

    await prisma.$transaction(
      batch.map((v) =>
        prisma.verse.upsert({
          where: {
            bookId_chapter_verse: {
              bookId: v.b,
              chapter: v.c,
              verse: v.v,
            },
          },
          update: {
            textEn: v.t,
            textKo: koMap.get(`${v.b}-${v.c}-${v.v}`) ?? v.t,
          },
          create: {
            bookId: v.b,
            chapter: v.c,
            verse: v.v,
            textEn: v.t,
            textKo: koMap.get(`${v.b}-${v.c}-${v.v}`) ?? v.t,
          },
        })
      )
    )

    inserted += batch.length
    if (inserted % 5000 === 0) {
      console.log(`  ${inserted} / ${kjvData.length} verses...`)
    }
  }

  console.log(`✅ Verses seeded: ${inserted}절`)
}

async function main() {
  console.log('🌱 Starting Bible database seed...\n')

  try {
    await seedBooks()
    await seedVerses()

    const verseCount = await prisma.verse.count()
    const bookCount = await prisma.book.count()
    console.log(`\n✅ Seed complete: ${bookCount}권, ${verseCount}절`)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
