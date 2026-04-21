'use client'
import { getReadingLevel } from '@/lib/levelSystem'
import { useBibleStore, THEMES } from '@/store/bibleStore'

interface LevelCardProps {
  versesRead: number
  totalVerses: number
}

export function LevelCard({ versesRead, totalVerses }: LevelCardProps) {
  if (totalVerses <= 0) return null
  const info = getReadingLevel(versesRead, totalVerses)
  const isMax = info.level >= 100
  const appTheme = useBibleStore((s) => s.theme)
  const tc = THEMES[appTheme]

  const colors =
    info.level >= 91 ? { from: 'from-amber-400',   to: 'to-orange-500',  bar: 'from-amber-400 to-orange-500',   badgeBg: '#fef3c7', badgeText: '#92400e', useTheme: false } :
    info.level >= 71 ? { from: 'from-violet-500',  to: 'to-purple-600',  bar: 'from-violet-400 to-purple-600',  badgeBg: '#ede9fe', badgeText: '#5b21b6', useTheme: false } :
    info.level >= 51 ? { from: 'from-sky-500',     to: 'to-blue-600',    bar: 'from-sky-400 to-blue-600',       badgeBg: '#e0f2fe', badgeText: '#0369a1', useTheme: false } :
    info.level >= 31 ? { from: 'from-emerald-500', to: 'to-teal-600',    bar: 'from-emerald-400 to-teal-600',   badgeBg: '#dcfce7', badgeText: '#166534', useTheme: false } :
                       { from: '', to: '', bar: '',                                                              badgeBg: tc.light,  badgeText: tc.primary, useTheme: true }

  const circleStyle = colors.useTheme
    ? { background: `linear-gradient(to bottom right, ${tc.primary}cc, ${tc.primary})` }
    : undefined
  const borderStyle = colors.useTheme
    ? { background: `linear-gradient(to bottom right, ${tc.primary}cc, ${tc.primary})` }
    : undefined

  return (
    <div className="mx-4 mb-4">
      <div
        className={`rounded-2xl p-px shadow-lg ${colors.useTheme ? '' : `bg-gradient-to-br ${colors.from} ${colors.to}`}`}
        style={borderStyle}
      >
        <div className="bg-white rounded-[14px] p-5">

          {/* 상단: 레벨 원 + 칭호 + 구절 정보 */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center shadow-md flex-shrink-0 ${colors.useTheme ? '' : `bg-gradient-to-br ${colors.from} ${colors.to}`}`}
              style={circleStyle}
            >
              <span className="text-[10px] font-bold text-white/80 leading-none">LV.</span>
              <span className="text-3xl font-black text-white leading-none">{info.level}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mb-1.5"
                style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}>
                <span>{info.emoji}</span>
                <span>{info.title}</span>
              </div>
              {isMax ? (
                <>
                  <p className="text-stone-800 font-bold text-base">성경 완독 달성! 🎉</p>
                  <p className="text-stone-400 text-xs mt-0.5">모든 {totalVerses.toLocaleString()}절을 읽었습니다</p>
                </>
              ) : (
                <>
                  <p className="text-stone-800 font-bold text-base">{versesRead.toLocaleString()}절 읽음</p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    다음 레벨까지 <span className="font-bold text-stone-600">{info.versesToNext.toLocaleString()}절</span> 더 읽기
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 경험치 바 */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-1.5">
              <span>LV.{info.level}</span>
              <span>{info.progressPct.toFixed(1)}%</span>
              {isMax ? <span>MAX</span> : <span>LV.{info.level + 1}</span>}
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${colors.useTheme ? '' : `bg-gradient-to-r ${colors.bar}`}`}
                style={colors.useTheme
                  ? { width: `${isMax ? 100 : info.progressPct}%`, backgroundColor: tc.primary }
                  : { width: `${isMax ? 100 : info.progressPct}%` }}
              />
            </div>
          </div>

          {/* 구간 점 + 다음 칭호 */}
          <div className="mt-3 flex items-center justify-between">
            <TierDots currentLevel={info.level} />
            <span className="text-xs text-stone-500 font-semibold">
              {isMax ? '최고 등급' : `다음 칭호: ${getNextTierLabel(info.level)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TierDots({ currentLevel }: { currentLevel: number }) {
  const appTheme = useBibleStore((s) => s.theme)
  const tc = THEMES[appTheme]
  const tiers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  return (
    <div className="flex items-center gap-1.5">
      {tiers.map((t) => (
        <div key={t} className="w-2 h-2 rounded-full transition-colors"
          style={{
            backgroundColor: currentLevel >= t ? tc.primary : '#e7e5e4',
          }} />
      ))}
    </div>
  )
}

const NEXT_TIER: Record<number, string> = {
  11: '새싹 🌿', 21: '묘목 🪴', 31: '순례자 🚶', 41: '학도 📚',
  51: '구도자 🔍', 61: '제자 ✝️', 71: '선생 📖', 81: '현인 🕊️',
  91: '성인 ⭐', 100: '완독자 👑',
}

function getNextTierLabel(level: number): string {
  const next = [11, 21, 31, 41, 51, 61, 71, 81, 91, 100].find((t) => t > level)
  return next ? (NEXT_TIER[next] ?? '') : ''
}
