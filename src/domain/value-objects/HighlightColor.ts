// Design Ref: §3.2 — 하이라이트 색상 Value Object
export type HighlightColor =
  | 'yellow' | 'orange' | 'red' | 'pink'
  | 'purple' | 'indigo' | 'blue' | 'teal'
  | 'green'  | 'lime'

export const HIGHLIGHT_COLORS: Record<HighlightColor, { label: string; bg: string; border: string; dot: string }> = {
  yellow: { label: '노랑',  bg: 'bg-yellow-200',  border: 'border-yellow-400',  dot: 'bg-yellow-400'  },
  orange: { label: '주황',  bg: 'bg-orange-200',  border: 'border-orange-400',  dot: 'bg-orange-400'  },
  red:    { label: '빨강',  bg: 'bg-red-200',     border: 'border-red-400',     dot: 'bg-red-400'     },
  pink:   { label: '분홍',  bg: 'bg-pink-200',    border: 'border-pink-400',    dot: 'bg-pink-400'    },
  purple: { label: '보라',  bg: 'bg-purple-200',  border: 'border-purple-400',  dot: 'bg-purple-400'  },
  indigo: { label: '남색',  bg: 'bg-indigo-200',  border: 'border-indigo-400',  dot: 'bg-indigo-400'  },
  blue:   { label: '파랑',  bg: 'bg-blue-200',    border: 'border-blue-400',    dot: 'bg-blue-400'    },
  teal:   { label: '청록',  bg: 'bg-teal-200',    border: 'border-teal-400',    dot: 'bg-teal-400'    },
  green:  { label: '초록',  bg: 'bg-green-200',   border: 'border-green-400',   dot: 'bg-green-400'   },
  lime:   { label: '연두',  bg: 'bg-lime-200',    border: 'border-lime-400',    dot: 'bg-lime-400'    },
}

export const HIGHLIGHT_COLOR_VALUES: HighlightColor[] = [
  'yellow', 'orange', 'red', 'pink',
  'purple', 'indigo', 'blue', 'teal',
  'green',  'lime',
]

export function isValidHighlightColor(value: string): value is HighlightColor {
  return HIGHLIGHT_COLOR_VALUES.includes(value as HighlightColor)
}
