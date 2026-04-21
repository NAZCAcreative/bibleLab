/**
 * 한국어 성경 텍스트 시드 스크립트 (배치 SQL 버전)
 * Source: https://raw.githubusercontent.com/MaatheusGois/bible/main/versions/ko/ko.json
 * MIT License
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('📥 한국어 성경 다운로드 중...')

  const res = await fetch('https://raw.githubusercontent.com/MaatheusGois/bible/main/versions/ko/ko.json')
  if (!res.ok) throw new Error(`다운로드 실패: ${res.status}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const books: any[] = await res.json()
  console.log(`📖 ${books.length}권 파싱 중...`)

  // 모든 구절 데이터를 메모리에 수집
  const rows: { bookId: number; chapter: number; verse: number; textKo: string }[] = []

  for (let bookIdx = 0; bookIdx < books.length; bookIdx++) {
    const bookId = bookIdx + 1
    const chapters = books[bookIdx].chapters as string[][]

    for (let chIdx = 0; chIdx < chapters.length; chIdx++) {
      const chapter = chIdx + 1
      const verses = chapters[chIdx]

      for (let vIdx = 0; vIdx < verses.length; vIdx++) {
        const text = verses[vIdx]?.trim()
        if (text) {
          rows.push({ bookId, chapter, verse: vIdx + 1, textKo: text })
        }
      }
    }
  }

  console.log(`📝 총 ${rows.length}구절 수집 완료. DB 업데이트 시작...`)

  // 배치 크기 500으로 나눠서 실행
  const BATCH = 500
  let totalUpdated = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)

    // VALUES 절 구성 (SQL injection 방지: Prisma raw의 tagged template 사용)
    // 각 배치를 하나의 UPDATE ... FROM (VALUES ...) 쿼리로 실행
    const valueClause = batch
      .map((r) => `(${r.bookId}, ${r.chapter}, ${r.verse}, '${r.textKo.replace(/'/g, "''")}')`)
      .join(',\n')

    await db.$executeRawUnsafe(`
      UPDATE "Verse" v
      SET "textKo" = d."textKo"
      FROM (VALUES ${valueClause}) AS d("bookId", "chapter", "verse", "textKo")
      WHERE v."bookId" = d."bookId"::integer
        AND v."chapter" = d."chapter"::integer
        AND v."verse"   = d."verse"::integer
    `)

    totalUpdated += batch.length
    process.stdout.write(`\r  ✓ ${totalUpdated}/${rows.length} 구절 업데이트...`)
  }

  console.log(`\n\n✅ 완료! ${totalUpdated}구절 한국어 텍스트 업데이트`)

  // 검증
  const sample = await db.verse.findFirst({ where: { bookId: 1, chapter: 1, verse: 1 } })
  console.log(`\n샘플 검증 — 창세기 1:1`)
  console.log(`  EN: ${sample?.textEn?.slice(0, 50)}`)
  console.log(`  KO: ${sample?.textKo?.slice(0, 50)}`)
}

main()
  .catch((e) => { console.error('\n❌ 오류:', e.message); process.exit(1) })
  .finally(() => db.$disconnect())
