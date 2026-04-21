// Design Ref: §3.2 — 성경 66권 책 메타데이터 Value Object

export type Testament = 'old' | 'new'

export interface BookMeta {
  id: number           // 1-66
  nameEn: string       // "Genesis"
  nameKo: string       // "창세기"
  nameAbbr: string     // "Gen"
  testament: Testament
  totalChapters: number
}

// 66권 전체 메타데이터
// Plan SC: FR-01 — 구약 39권 + 신약 27권 전체 지원
export const BOOKS: BookMeta[] = [
  // 구약 (39권)
  { id: 1,  nameEn: 'Genesis',        nameKo: '창세기',     nameAbbr: 'Gen',  testament: 'old', totalChapters: 50 },
  { id: 2,  nameEn: 'Exodus',         nameKo: '출애굽기',   nameAbbr: 'Exo',  testament: 'old', totalChapters: 40 },
  { id: 3,  nameEn: 'Leviticus',      nameKo: '레위기',     nameAbbr: 'Lev',  testament: 'old', totalChapters: 27 },
  { id: 4,  nameEn: 'Numbers',        nameKo: '민수기',     nameAbbr: 'Num',  testament: 'old', totalChapters: 36 },
  { id: 5,  nameEn: 'Deuteronomy',    nameKo: '신명기',     nameAbbr: 'Deu',  testament: 'old', totalChapters: 34 },
  { id: 6,  nameEn: 'Joshua',         nameKo: '여호수아',   nameAbbr: 'Jos',  testament: 'old', totalChapters: 24 },
  { id: 7,  nameEn: 'Judges',         nameKo: '사사기',     nameAbbr: 'Jdg',  testament: 'old', totalChapters: 21 },
  { id: 8,  nameEn: 'Ruth',           nameKo: '룻기',       nameAbbr: 'Rut',  testament: 'old', totalChapters: 4  },
  { id: 9,  nameEn: '1 Samuel',       nameKo: '사무엘상',   nameAbbr: '1Sa',  testament: 'old', totalChapters: 31 },
  { id: 10, nameEn: '2 Samuel',       nameKo: '사무엘하',   nameAbbr: '2Sa',  testament: 'old', totalChapters: 24 },
  { id: 11, nameEn: '1 Kings',        nameKo: '열왕기상',   nameAbbr: '1Ki',  testament: 'old', totalChapters: 22 },
  { id: 12, nameEn: '2 Kings',        nameKo: '열왕기하',   nameAbbr: '2Ki',  testament: 'old', totalChapters: 25 },
  { id: 13, nameEn: '1 Chronicles',   nameKo: '역대상',     nameAbbr: '1Ch',  testament: 'old', totalChapters: 29 },
  { id: 14, nameEn: '2 Chronicles',   nameKo: '역대하',     nameAbbr: '2Ch',  testament: 'old', totalChapters: 36 },
  { id: 15, nameEn: 'Ezra',           nameKo: '에스라',     nameAbbr: 'Ezr',  testament: 'old', totalChapters: 10 },
  { id: 16, nameEn: 'Nehemiah',       nameKo: '느헤미야',   nameAbbr: 'Neh',  testament: 'old', totalChapters: 13 },
  { id: 17, nameEn: 'Esther',         nameKo: '에스더',     nameAbbr: 'Est',  testament: 'old', totalChapters: 10 },
  { id: 18, nameEn: 'Job',            nameKo: '욥기',       nameAbbr: 'Job',  testament: 'old', totalChapters: 42 },
  { id: 19, nameEn: 'Psalms',         nameKo: '시편',       nameAbbr: 'Psa',  testament: 'old', totalChapters: 150},
  { id: 20, nameEn: 'Proverbs',       nameKo: '잠언',       nameAbbr: 'Pro',  testament: 'old', totalChapters: 31 },
  { id: 21, nameEn: 'Ecclesiastes',   nameKo: '전도서',     nameAbbr: 'Ecc',  testament: 'old', totalChapters: 12 },
  { id: 22, nameEn: 'Song of Songs',  nameKo: '아가',       nameAbbr: 'Son',  testament: 'old', totalChapters: 8  },
  { id: 23, nameEn: 'Isaiah',         nameKo: '이사야',     nameAbbr: 'Isa',  testament: 'old', totalChapters: 66 },
  { id: 24, nameEn: 'Jeremiah',       nameKo: '예레미야',   nameAbbr: 'Jer',  testament: 'old', totalChapters: 52 },
  { id: 25, nameEn: 'Lamentations',   nameKo: '예레미야애가',nameAbbr: 'Lam', testament: 'old', totalChapters: 5  },
  { id: 26, nameEn: 'Ezekiel',        nameKo: '에스겔',     nameAbbr: 'Eze',  testament: 'old', totalChapters: 48 },
  { id: 27, nameEn: 'Daniel',         nameKo: '다니엘',     nameAbbr: 'Dan',  testament: 'old', totalChapters: 12 },
  { id: 28, nameEn: 'Hosea',          nameKo: '호세아',     nameAbbr: 'Hos',  testament: 'old', totalChapters: 14 },
  { id: 29, nameEn: 'Joel',           nameKo: '요엘',       nameAbbr: 'Joe',  testament: 'old', totalChapters: 3  },
  { id: 30, nameEn: 'Amos',           nameKo: '아모스',     nameAbbr: 'Amo',  testament: 'old', totalChapters: 9  },
  { id: 31, nameEn: 'Obadiah',        nameKo: '오바댜',     nameAbbr: 'Oba',  testament: 'old', totalChapters: 1  },
  { id: 32, nameEn: 'Jonah',          nameKo: '요나',       nameAbbr: 'Jon',  testament: 'old', totalChapters: 4  },
  { id: 33, nameEn: 'Micah',          nameKo: '미가',       nameAbbr: 'Mic',  testament: 'old', totalChapters: 7  },
  { id: 34, nameEn: 'Nahum',          nameKo: '나훔',       nameAbbr: 'Nah',  testament: 'old', totalChapters: 3  },
  { id: 35, nameEn: 'Habakkuk',       nameKo: '하박국',     nameAbbr: 'Hab',  testament: 'old', totalChapters: 3  },
  { id: 36, nameEn: 'Zephaniah',      nameKo: '스바냐',     nameAbbr: 'Zep',  testament: 'old', totalChapters: 3  },
  { id: 37, nameEn: 'Haggai',         nameKo: '학개',       nameAbbr: 'Hag',  testament: 'old', totalChapters: 2  },
  { id: 38, nameEn: 'Zechariah',      nameKo: '스가랴',     nameAbbr: 'Zec',  testament: 'old', totalChapters: 14 },
  { id: 39, nameEn: 'Malachi',        nameKo: '말라기',     nameAbbr: 'Mal',  testament: 'old', totalChapters: 4  },
  // 신약 (27권)
  { id: 40, nameEn: 'Matthew',        nameKo: '마태복음',   nameAbbr: 'Mat',  testament: 'new', totalChapters: 28 },
  { id: 41, nameEn: 'Mark',           nameKo: '마가복음',   nameAbbr: 'Mar',  testament: 'new', totalChapters: 16 },
  { id: 42, nameEn: 'Luke',           nameKo: '누가복음',   nameAbbr: 'Luk',  testament: 'new', totalChapters: 24 },
  { id: 43, nameEn: 'John',           nameKo: '요한복음',   nameAbbr: 'Joh',  testament: 'new', totalChapters: 21 },
  { id: 44, nameEn: 'Acts',           nameKo: '사도행전',   nameAbbr: 'Act',  testament: 'new', totalChapters: 28 },
  { id: 45, nameEn: 'Romans',         nameKo: '로마서',     nameAbbr: 'Rom',  testament: 'new', totalChapters: 16 },
  { id: 46, nameEn: '1 Corinthians',  nameKo: '고린도전서', nameAbbr: '1Co',  testament: 'new', totalChapters: 16 },
  { id: 47, nameEn: '2 Corinthians',  nameKo: '고린도후서', nameAbbr: '2Co',  testament: 'new', totalChapters: 13 },
  { id: 48, nameEn: 'Galatians',      nameKo: '갈라디아서', nameAbbr: 'Gal',  testament: 'new', totalChapters: 6  },
  { id: 49, nameEn: 'Ephesians',      nameKo: '에베소서',   nameAbbr: 'Eph',  testament: 'new', totalChapters: 6  },
  { id: 50, nameEn: 'Philippians',    nameKo: '빌립보서',   nameAbbr: 'Phi',  testament: 'new', totalChapters: 4  },
  { id: 51, nameEn: 'Colossians',     nameKo: '골로새서',   nameAbbr: 'Col',  testament: 'new', totalChapters: 4  },
  { id: 52, nameEn: '1 Thessalonians',nameKo: '데살로니가전서',nameAbbr:'1Th', testament: 'new', totalChapters: 5  },
  { id: 53, nameEn: '2 Thessalonians',nameKo: '데살로니가후서',nameAbbr:'2Th', testament: 'new', totalChapters: 3  },
  { id: 54, nameEn: '1 Timothy',      nameKo: '디모데전서', nameAbbr: '1Ti',  testament: 'new', totalChapters: 6  },
  { id: 55, nameEn: '2 Timothy',      nameKo: '디모데후서', nameAbbr: '2Ti',  testament: 'new', totalChapters: 4  },
  { id: 56, nameEn: 'Titus',          nameKo: '디도서',     nameAbbr: 'Tit',  testament: 'new', totalChapters: 3  },
  { id: 57, nameEn: 'Philemon',       nameKo: '빌레몬서',   nameAbbr: 'Phm',  testament: 'new', totalChapters: 1  },
  { id: 58, nameEn: 'Hebrews',        nameKo: '히브리서',   nameAbbr: 'Heb',  testament: 'new', totalChapters: 13 },
  { id: 59, nameEn: 'James',          nameKo: '야고보서',   nameAbbr: 'Jas',  testament: 'new', totalChapters: 5  },
  { id: 60, nameEn: '1 Peter',        nameKo: '베드로전서', nameAbbr: '1Pe',  testament: 'new', totalChapters: 5  },
  { id: 61, nameEn: '2 Peter',        nameKo: '베드로후서', nameAbbr: '2Pe',  testament: 'new', totalChapters: 3  },
  { id: 62, nameEn: '1 John',         nameKo: '요한일서',   nameAbbr: '1Jo',  testament: 'new', totalChapters: 5  },
  { id: 63, nameEn: '2 John',         nameKo: '요한이서',   nameAbbr: '2Jo',  testament: 'new', totalChapters: 1  },
  { id: 64, nameEn: '3 John',         nameKo: '요한삼서',   nameAbbr: '3Jo',  testament: 'new', totalChapters: 1  },
  { id: 65, nameEn: 'Jude',           nameKo: '유다서',     nameAbbr: 'Jud',  testament: 'new', totalChapters: 1  },
  { id: 66, nameEn: 'Revelation',     nameKo: '요한계시록', nameAbbr: 'Rev',  testament: 'new', totalChapters: 22 },
]

export const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.totalChapters, 0) // 1189

export function getBookById(id: number): BookMeta | undefined {
  return BOOKS.find((b) => b.id === id)
}

export function getBookByAbbr(abbr: string): BookMeta | undefined {
  return BOOKS.find((b) => b.nameAbbr.toLowerCase() === abbr.toLowerCase())
}
