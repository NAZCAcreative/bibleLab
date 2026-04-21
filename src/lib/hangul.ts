const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const BASE = 0xAC00
const STEP = 21 * 28  // 588 syllables per chosung

export function hasChosung(query: string): boolean {
  return Array.from(query).some(c => CHOSUNG.includes(c))
}

// 초성 포함 쿼리 → PostgreSQL ~* 정규식 패턴으로 변환
// 예: "ㅎㄴ님" → "[하-힣][나-닣]님"
export function buildChosungPattern(query: string): string {
  return Array.from(query)
    .map(c => {
      const idx = CHOSUNG.indexOf(c)
      if (idx === -1) return escapeRegexChar(c)
      const start = String.fromCharCode(BASE + idx * STEP)
      const end   = String.fromCharCode(BASE + (idx + 1) * STEP - 1)
      return `[${start}-${end}]`
    })
    .join('')
}

function escapeRegexChar(c: string): string {
  return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
