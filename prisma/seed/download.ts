/**
 * KJV 성경 데이터 다운로드 스크립트
 *
 * 소스: scrollmapper/bible_databases (GitHub, 공개 도메인)
 * 형식 출력: { b: bookId, c: chapter, v: verse, t: text }[]
 *
 * 사용법: npx tsx prisma/seed/download.ts
 */

import { writeFileSync } from 'fs'
import { join } from 'path'

const KJV_URL =
  'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json'

interface KJVVerse {
  verse: number
  text: string
}
interface KJVChapter {
  chapter: number
  verses: KJVVerse[]
}
interface KJVBook {
  name: string
  chapters: KJVChapter[]
}
interface KJVData {
  translation: string
  books: KJVBook[]
}

interface SimpleVerse {
  b: number
  c: number
  v: number
  t: string
}

async function downloadKJV() {
  console.log('⬇️  Downloading KJV data from GitHub...')
  console.log(`   Source: ${KJV_URL}`)

  const response = await fetch(KJV_URL)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const raw = (await response.json()) as KJVData

  const verses: SimpleVerse[] = []
  raw.books.forEach((book, bookIdx) => {
    const bookId = bookIdx + 1  // 1-based book id
    book.chapters.forEach((chapter) => {
      chapter.verses.forEach((verse) => {
        verses.push({
          b: bookId,
          c: chapter.chapter,
          v: verse.verse,
          t: verse.text,
        })
      })
    })
  })

  const outputPath = join(__dirname, 'kjv.json')
  writeFileSync(outputPath, JSON.stringify(verses, null, 0))

  console.log(`✅ KJV downloaded: ${verses.length}절 → ${outputPath}`)
}

downloadKJV().catch((err) => {
  console.error('❌ Download failed:', err)
  process.exit(1)
})
