export const TOTAL_BIBLE_VERSES = 31102

export function getVerseLevel(verseCount: number): number {
  return Math.min(201, Math.floor((verseCount / TOTAL_BIBLE_VERSES) * 200) + 1)
}

export function getTotalLevel(verseCount: number, prestige: number): number {
  return prestige * 200 + getVerseLevel(verseCount)
}

export function getTitle(totalLevel: number): string {
  const idx = Math.floor((totalLevel - 1) / 2) % 100
  return LEVEL_TITLES[idx]
}

export function getLevelInfo(verseCount: number, prestige: number) {
  const verseLevel = getVerseLevel(verseCount)
  const totalLevel = getTotalLevel(verseCount, prestige)
  const title = getTitle(totalLevel)
  const versesPerLevel = TOTAL_BIBLE_VERSES / 200
  const prevVerses = Math.ceil((verseLevel - 1) * versesPerLevel)
  const progressInLevel = verseLevel < 201
    ? Math.max(0, Math.min(100, ((verseCount - prevVerses) / versesPerLevel) * 100))
    : 100
  return { verseLevel, totalLevel, title, progressInLevel, prestige }
}

// Backward-compat shim for LevelCard / community badge (old 1-100 scale)
export function getReadingLevel(verseCount: number, _totalVerses: number) {
  const info = getLevelInfo(verseCount, 0)
  const level = Math.min(100, Math.ceil(info.verseLevel / 2))
  const versesPerLevel = TOTAL_BIBLE_VERSES / 200
  const nextThreshold = Math.ceil(info.verseLevel * versesPerLevel)
  const versesToNext = Math.max(0, nextThreshold - verseCount)
  const emoji =
    level >= 91 ? '⭐' : level >= 71 ? '🔥' : level >= 51 ? '📚' : level >= 31 ? '🌿' : '🌱'
  return { level, emoji, title: info.title, progressPct: info.progressInLevel, versesToNext }
}

export const LEVEL_TITLES: string[] = [
  // ── 씨앗 단계 (1-10) ───────────────────────────────────
  '씨앗',           '새싹',           '묘목',           '어린 가지',
  '자라는 나무',    '든든한 가지',    '열매 맺는 자',   '빛을 찾는 자',
  '길을 묻는 자',   '진리를 향한 자',
  // ── 여정 단계 (11-20) ──────────────────────────────────
  '순례 시작자',    '말씀 나그네',    '진리 여행자',    '성경 동반자',
  '말씀 탐구자',    '빛의 나그네',    '믿음의 걸음',    '성경 순례자',
  '진리 항해자',    '말씀 탐험가',
  // ── 성장 단계 (21-30) ──────────────────────────────────
  '성경 학생',      '말씀 수련자',    '진리 연구자',    '성경 탐구인',
  '말씀 익힘이',    '진리 묵상자',    '성경 이해자',    '말씀 구도자',
  '진리 공부자',    '성경 수련자',
  // ── 헌신 단계 (31-40) ──────────────────────────────────
  '말씀의 종',      '성경 충성자',    '진리 헌신자',    '말씀 사랑자',
  '성경 애호가',    '진리의 열정자',  '말씀 사모자',    '성경의 갈망자',
  '진리 사랑자',    '말씀 헌신자',
  // ── 지혜 단계 (41-50) ──────────────────────────────────
  '말씀의 지혜자',  '성경의 현자',    '진리 분별자',    '말씀 통찰자',
  '성경 명철자',    '진리의 지혜자',  '말씀 선각자',    '성경 깨달은 자',
  '진리 밝은 자',   '말씀의 빛',
  // ── 믿음 단계 (51-60) ──────────────────────────────────
  '믿음의 용사',    '진리의 전사',    '말씀의 군사',    '성경의 용사',
  '믿음의 수호자',  '진리 파수꾼',    '말씀 경호원',    '성경 지킴이',
  '믿음 파수꾼',    '진리의 방패',
  // ── 능력 단계 (61-70) ──────────────────────────────────
  '말씀의 능력자',  '성경의 강자',    '진리의 강인자',  '말씀의 용사',
  '성경의 영웅',    '진리의 챔피언',  '말씀의 승리자',  '성경의 정복자',
  '진리의 개선자',  '말씀의 성자',
  // ── 빛 단계 (71-80) ────────────────────────────────────
  '빛의 전달자',    '진리의 등불',    '말씀의 광채',    '성경의 빛',
  '진리의 별',      '말씀의 횃불',    '성경의 등대',    '진리의 광명',
  '말씀의 빛줄기',  '성경의 광채',
  // ── 섬김 단계 (81-90) ──────────────────────────────────
  '말씀의 선생',    '성경의 교사',    '진리의 전도자',  '말씀의 증인',
  '성경의 사자',    '진리의 선포자',  '말씀의 나팔수',  '성경의 메신저',
  '진리의 전령',    '말씀의 선포자',
  // ── 완성 단계 (91-100) ─────────────────────────────────
  '성경 정통자',    '말씀의 마스터',  '진리의 완성자',  '성경 통독자',
  '말씀의 완독자',  '진리의 완성자',  '성경의 사도',    '말씀의 사도',
  '진리의 사도',    '완독 사도',
]
