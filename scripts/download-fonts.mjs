/**
 * 구글 폰트 한글 30개 + 영문 30개 다운로드 스크립트
 * 실행: node scripts/download-fonts.mjs
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── 한글 폰트 30개 ─────────────────────────────────
const KOREAN_FONTS = [
  { slug: 'noto-sans-kr',       name: 'Noto Sans KR',         weights: ['400','700'] },
  { slug: 'noto-serif-kr',      name: 'Noto Serif KR',        weights: ['400','600'] },
  { slug: 'gothic-a1',          name: 'Gothic A1',            weights: ['400','700'] },
  { slug: 'nanum-gothic',       name: 'Nanum Gothic',         weights: ['400','700'] },
  { slug: 'nanum-myeongjo',     name: 'Nanum Myeongjo',       weights: ['400','700'] },
  { slug: 'nanum-gothic-coding',name: 'Nanum Gothic Coding',  weights: ['400','700'] },
  { slug: 'black-han-sans',     name: 'Black Han Sans',       weights: ['400'] },
  { slug: 'do-hyeon',           name: 'Do Hyeon',             weights: ['400'] },
  { slug: 'jua',                name: 'Jua',                  weights: ['400'] },
  { slug: 'sunflower',          name: 'Sunflower',            weights: ['300','500','700'] },
  { slug: 'gaegu',              name: 'Gaegu',                weights: ['300','400','700'] },
  { slug: 'gamja-flower',       name: 'Gamja Flower',         weights: ['400'] },
  { slug: 'hi-melody',          name: 'Hi Melody',            weights: ['400'] },
  { slug: 'kirang-haerang',     name: 'Kirang Haerang',       weights: ['400'] },
  { slug: 'yeon-sung',          name: 'Yeon Sung',            weights: ['400'] },
  { slug: 'poor-story',         name: 'Poor Story',           weights: ['400'] },
  { slug: 'east-sea-dokdo',     name: 'East Sea Dokdo',       weights: ['400'] },
  { slug: 'cute-font',          name: 'Cute Font',            weights: ['400'] },
  { slug: 'song-myung',         name: 'Song Myung',           weights: ['400'] },
  { slug: 'nanum-pen-script',   name: 'Nanum Pen Script',     weights: ['400'] },
  { slug: 'gugi',               name: 'Gugi',                 weights: ['400'] },
  { slug: 'gowun-dodum',        name: 'Gowun Dodum',          weights: ['400'] },
  { slug: 'gowun-batang',       name: 'Gowun Batang',         weights: ['400','700'] },
  { slug: 'orbit',              name: 'Orbit',                weights: ['400'] },
  { slug: 'hahmlet',            name: 'Hahmlet',              weights: ['400'] },
  { slug: 'ibm-plex-sans-kr',   name: 'IBM Plex Sans KR',    weights: ['400','700'] },
  { slug: 'single-day',         name: 'Single Day',           weights: ['400'] },
  { slug: 'dokdo',              name: 'Dokdo',                weights: ['400'] },
  { slug: 'nanum-brush-script', name: 'Nanum Brush Script',   weights: ['400'] },
  { slug: 'black-and-white-picture', name: 'Black And White Picture', weights: ['400'] },
]

// ── 영문 폰트 30개 ─────────────────────────────────
const ENGLISH_FONTS = [
  { slug: 'lora',               name: 'Lora',                 weights: ['400','600'] },
  { slug: 'merriweather',       name: 'Merriweather',         weights: ['400','700'] },
  { slug: 'eb-garamond',        name: 'EB Garamond',          weights: ['400','600'] },
  { slug: 'playfair-display',   name: 'Playfair Display',     weights: ['400','600'] },
  { slug: 'crimson-text',       name: 'Crimson Text',         weights: ['400','600'] },
  { slug: 'cormorant-garamond', name: 'Cormorant Garamond',   weights: ['400','600'] },
  { slug: 'libre-baskerville',  name: 'Libre Baskerville',    weights: ['400','700'] },
  { slug: 'spectral',           name: 'Spectral',             weights: ['400','600'] },
  { slug: 'pt-serif',           name: 'PT Serif',             weights: ['400','700'] },
  { slug: 'alegreya',           name: 'Alegreya',             weights: ['400','700'] },
  { slug: 'josefin-sans',       name: 'Josefin Sans',         weights: ['400','600'] },
  { slug: 'raleway',            name: 'Raleway',              weights: ['400','600'] },
  { slug: 'nunito',             name: 'Nunito',               weights: ['400','600'] },
  { slug: 'open-sans',          name: 'Open Sans',            weights: ['400','600'] },
  { slug: 'poppins',            name: 'Poppins',              weights: ['400','500'] },
  { slug: 'work-sans',          name: 'Work Sans',            weights: ['400','500'] },
  { slug: 'dm-sans',            name: 'DM Sans',              weights: ['400','500'] },
  { slug: 'source-serif-4',     name: 'Source Serif 4',       weights: ['400','600'] },
  { slug: 'frank-ruhl-libre',   name: 'Frank Ruhl Libre',     weights: ['400','700'] },
  { slug: 'inter',              name: 'Inter',                weights: ['400','500'] },
  { slug: 'roboto',             name: 'Roboto',               weights: ['400','700'] },
  { slug: 'montserrat',         name: 'Montserrat',           weights: ['400','600'] },
  { slug: 'ubuntu',             name: 'Ubuntu',               weights: ['400','700'] },
  { slug: 'oswald',             name: 'Oswald',               weights: ['400','600'] },
  { slug: 'lato',               name: 'Lato',                 weights: ['400','700'] },
  { slug: 'source-code-pro',    name: 'Source Code Pro',      weights: ['400','600'] },
  { slug: 'roboto-slab',        name: 'Roboto Slab',          weights: ['400','700'] },
  { slug: 'bitter',             name: 'Bitter',               weights: ['400','600'] },
  { slug: 'arvo',               name: 'Arvo',                 weights: ['400','700'] },
  { slug: 'vollkorn',           name: 'Vollkorn',             weights: ['400','600'] },
]

// ── 유틸리티 ───────────────────────────────────────

async function fetchText(url, headers = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.text()
}

async function fetchBinary(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.arrayBuffer()
}

/** Google Fonts CSS2 API → woff2 블록 파싱 */
function parseFontFaces(css) {
  // 모든 @font-face 블록을 인덱스 기반으로 추출
  const faces = []
  const blockRe = /@font-face\s*\{([^}]+)\}/g
  let m
  let idx = 0

  while ((m = blockRe.exec(css)) !== null) {
    const body = m[1]

    const urlMatch    = body.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)
    const weightMatch = body.match(/font-weight:\s*(\d+)/)
    const rangeMatch  = body.match(/unicode-range:\s*([^;]+)/)

    if (!urlMatch) { idx++; continue }

    // 해당 @font-face 앞의 주석에서 subset 이름 추출
    const before = css.slice(0, m.index)
    const commentMatch = before.match(/\/\*\s*([^*]+?)\s*\*\/\s*$/)
    const subset = commentMatch ? commentMatch[1].trim() : `s${idx}`

    faces.push({
      subset,
      weight: weightMatch ? weightMatch[1] : '400',
      url:    urlMatch[1],
      range:  rangeMatch ? rangeMatch[1].trim() : '',
    })
    idx++
  }

  return faces
}

/** 단일 폰트 처리 */
async function processFont(font, category) {
  const family = font.name.replace(/ /g, '+')
  const wghts  = font.weights.join(';')
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${wghts}&display=swap`

  let css
  try {
    css = await fetchText(cssUrl)
  } catch (e) {
    console.error(`  ✗ CSS 실패 [${font.name}]: ${e.message}`)
    return []
  }

  const faces = parseFontFaces(css)
  if (faces.length === 0) {
    console.warn(`  ⚠ 파싱 결과 없음 [${font.name}]`)
    return []
  }

  const fontDir = join('public', 'fonts', category, font.slug)
  mkdirSync(fontDir, { recursive: true })

  const localFaces = []
  const seenKeys = new Set()

  for (const face of faces) {
    const key = `${face.weight}-${face.subset}`
    if (seenKeys.has(key)) continue
    seenKeys.add(key)

    const filename = `${font.slug}-${face.weight}-${face.subset}.woff2`
    const filepath = join(fontDir, filename)
    const localPath = `/fonts/${category}/${font.slug}/${filename}`

    try {
      if (!existsSync(filepath)) {
        const buf = await fetchBinary(face.url)
        writeFileSync(filepath, Buffer.from(buf))
        process.stdout.write('.')
      } else {
        process.stdout.write('_')
      }
      localFaces.push({ ...face, localPath, filename })
    } catch (e) {
      process.stdout.write('x')
    }
  }

  return localFaces
}

/** @font-face CSS 생성 */
function buildFontFaceCSS(fontName, localFaces) {
  return localFaces.map((f) => {
    const rangeDecl = f.range ? `\n  unicode-range: ${f.range};` : ''
    return `/* ${fontName} ${f.weight} ${f.subset} */
@font-face {
  font-family: '${fontName}';
  font-style: normal;
  font-weight: ${f.weight};
  font-display: swap;
  src: url('${f.localPath}') format('woff2');${rangeDecl}
}`
  }).join('\n\n')
}

// ── 메인 ──────────────────────────────────────────

async function main() {
  const startTime = Date.now()
  console.log('🔤 폰트 다운로드 시작\n')

  mkdirSync(join('public', 'fonts', 'korean'), { recursive: true })
  mkdirSync(join('public', 'fonts', 'english'), { recursive: true })

  let allCSS = `/* BibleLab 로컬 폰트 — auto-generated by scripts/download-fonts.mjs */\n\n`
  const summary = { ok: [], fail: [] }

  // ── 한글 폰트 ──
  console.log('━━━ 한글 폰트 ━━━')
  for (const font of KOREAN_FONTS) {
    process.stdout.write(`[${font.slug}] `)
    try {
      const faces = await processFont(font, 'korean')
      if (faces.length > 0) {
        allCSS += buildFontFaceCSS(font.name, faces) + '\n\n'
        summary.ok.push(font.slug)
        console.log(` ✓ (${faces.length}개)`)
      } else {
        summary.fail.push(font.slug)
        console.log(' ✗')
      }
    } catch (e) {
      summary.fail.push(font.slug)
      console.log(` ✗ ${e.message}`)
    }
  }

  // ── 영문 폰트 ──
  console.log('\n━━━ 영문 폰트 ━━━')
  for (const font of ENGLISH_FONTS) {
    process.stdout.write(`[${font.slug}] `)
    try {
      const faces = await processFont(font, 'english')
      if (faces.length > 0) {
        allCSS += buildFontFaceCSS(font.name, faces) + '\n\n'
        summary.ok.push(font.slug)
        console.log(` ✓ (${faces.length}개)`)
      } else {
        summary.fail.push(font.slug)
        console.log(' ✗')
      }
    } catch (e) {
      summary.fail.push(font.slug)
      console.log(` ✗ ${e.message}`)
    }
  }

  // ── CSS 파일 저장 ──
  const cssPath = join('public', 'fonts', 'fonts.css')
  writeFileSync(cssPath, allCSS, 'utf-8')

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('\n━━━ 완료 ━━━')
  console.log(`✅ 성공: ${summary.ok.length}개`)
  if (summary.fail.length > 0) console.log(`❌ 실패: ${summary.fail.length}개 → ${summary.fail.join(', ')}`)
  console.log(`📄 CSS: ${cssPath}`)
  console.log(`⏱  ${elapsed}s`)
}

main().catch(console.error)
