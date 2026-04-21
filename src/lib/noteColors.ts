export const NOTE_COLORS = [
  { key: 'yellow',  bg: '#fef08a', dark: '#ca8a04' },
  { key: 'lime',    bg: '#d9f99d', dark: '#65a30d' },
  { key: 'green',   bg: '#bbf7d0', dark: '#16a34a' },
  { key: 'teal',    bg: '#99f6e4', dark: '#0d9488' },
  { key: 'sky',     bg: '#bae6fd', dark: '#0284c7' },
  { key: 'blue',    bg: '#bfdbfe', dark: '#2563eb' },
  { key: 'violet',  bg: '#ddd6fe', dark: '#7c3aed' },
  { key: 'purple',  bg: '#e9d5ff', dark: '#9333ea' },
  { key: 'pink',    bg: '#fbcfe8', dark: '#db2777' },
  { key: 'rose',    bg: '#fecdd3', dark: '#e11d48' },
  { key: 'orange',  bg: '#fed7aa', dark: '#ea580c' },
  { key: 'stone',   bg: '#e7e5e4', dark: '#57534e' },
] as const

export type NoteColor = typeof NOTE_COLORS[number]['key']

export function getNoteColor(key: string) {
  return NOTE_COLORS.find((c) => c.key === key) ?? NOTE_COLORS[0]
}
