// Design Ref: §9.1 — Bible Repository Prisma 구현체
// Infrastructure 레이어: Domain 인터페이스를 Prisma로 구현
import { prisma } from '../client'
import type { IBibleRepository } from '@/domain/repositories/IBibleRepository'
import type { VerseWithBook } from '@/domain/entities/Verse'
import type { Language } from '@/domain/value-objects/Language'
import { hasChosung, buildChosungPattern } from '@/lib/hangul'

export class PrismaBibleRepository implements IBibleRepository {
  async getChapter(bookId: number, chapter: number): Promise<VerseWithBook[]> {
    const verses = await prisma.verse.findMany({
      where: { bookId, chapter },
      orderBy: { verse: 'asc' },
      include: {
        book: {
          select: { id: true, nameEn: true, nameKo: true, nameAbbr: true },
        },
      },
    })
    return verses as VerseWithBook[]
  }

  async getVerse(bookId: number, chapter: number, verse: number): Promise<VerseWithBook | null> {
    const result = await prisma.verse.findUnique({
      where: { bookId_chapter_verse: { bookId, chapter, verse } },
      include: {
        book: {
          select: { id: true, nameEn: true, nameKo: true, nameAbbr: true },
        },
      },
    })
    return result as VerseWithBook | null
  }

  async searchVerses(query: string, lang: Language): Promise<VerseWithBook[]> {
    // 초성 포함 → PostgreSQL 정규식 검색
    if (lang !== 'en' && hasChosung(query)) {
      const pattern = buildChosungPattern(query)
      type RawRow = {
        id: string; bookId: number; chapter: number; verse: number
        textKo: string | null; textEn: string
        book_id: number; name_ko: string; name_en: string; name_abbr: string
      }
      const rows = await prisma.$queryRaw<RawRow[]>`
        SELECT v.id, v."bookId", v.chapter, v.verse, v."textKo", v."textEn",
               b.id AS book_id, b."nameKo" AS name_ko, b."nameEn" AS name_en, b."nameAbbr" AS name_abbr
        FROM "Verse" v
        JOIN "Book" b ON v."bookId" = b.id
        WHERE v."textKo" ~* ${pattern}
        ORDER BY v."bookId", v.chapter, v.verse
        LIMIT 50
      `
      return rows.map(r => ({
        id: r.id, bookId: r.bookId, chapter: r.chapter, verse: r.verse,
        textKo: r.textKo ?? '', textEn: r.textEn,
        book: { id: r.book_id, nameKo: r.name_ko, nameEn: r.name_en, nameAbbr: r.name_abbr },
      }))
    }

    // 한국어: $queryRaw LIKE (ILIKE가 C locale에서 한글 미지원)
    if (lang === 'ko') {
      type RawRow = {
        id: string; bookId: number; chapter: number; verse: number
        textKo: string | null; textEn: string
        book_id: number; name_ko: string; name_en: string; name_abbr: string
      }
      const pattern = `%${query}%`
      const rows = await prisma.$queryRaw<RawRow[]>`
        SELECT v.id, v."bookId", v.chapter, v.verse, v."textKo", v."textEn",
               b.id AS book_id, b."nameKo" AS name_ko, b."nameEn" AS name_en, b."nameAbbr" AS name_abbr
        FROM "Verse" v
        JOIN "Book" b ON v."bookId" = b.id
        WHERE v."textKo" LIKE ${pattern}
        ORDER BY v."bookId", v.chapter, v.verse
        LIMIT 50
      `
      return rows.map(r => ({
        id: r.id, bookId: r.bookId, chapter: r.chapter, verse: r.verse,
        textKo: r.textKo ?? '', textEn: r.textEn,
        book: { id: r.book_id, nameKo: r.name_ko, nameEn: r.name_en, nameAbbr: r.name_abbr },
      }))
    }

    // 영어: ILIKE (대소문자 무시)
    const searchCondition =
      lang === 'en'
        ? { textEn: { contains: query, mode: 'insensitive' as const } }
        : {
            OR: [
              { textEn: { contains: query, mode: 'insensitive' as const } },
              { textKo: { contains: query } },
            ],
          }

    const verses = await prisma.verse.findMany({
      where: searchCondition,
      take: 50,
      include: {
        book: { select: { id: true, nameEn: true, nameKo: true, nameAbbr: true } },
      },
      orderBy: [{ bookId: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }],
    })
    return verses as VerseWithBook[]
  }
}
