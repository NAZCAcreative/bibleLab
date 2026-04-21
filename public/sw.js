// Design Ref: §2.1 — Service Worker: Cache-First for /api/bible/**, Network-First for others
// Plan SC: 오프라인 읽기 지원

const CACHE_VERSION = 'v5'
const BIBLE_CACHE = `bible-data-${CACHE_VERSION}`
const STATIC_CACHE = `static-${CACHE_VERSION}`

// ---------- Install ----------
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

// ---------- Activate ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== BIBLE_CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ---------- Fetch ----------
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-HTTP requests (chrome-extension://, data:, etc.)
  if (!request.url.startsWith('http')) return

  // Cache API only supports GET — skip all other methods
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // 성경 API: Cache-First (오프라인 읽기 핵심)
  if (url.pathname.startsWith('/api/bible/')) {
    event.respondWith(cacheFirst(request, BIBLE_CACHE))
    return
  }

  // 폰트: Cache-First (변경 없음)
  if (request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // JS/CSS 번들: Network-First (항상 최신 코드)
  if (
    request.destination === 'script' ||
    request.destination === 'style'
  ) {
    event.respondWith(networkFirst(request))
    return
  }

  // 나머지: Network-First
  event.respondWith(networkFirst(request))
})

// ---------- Strategies ----------

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'OFFLINE_MODE', message: '오프라인 상태입니다.' } }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    if (request.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: { code: 'OFFLINE_MODE', message: '오프라인 상태입니다.' } }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const cache = await caches.open(STATIC_CACHE)
    const cached = await cache.match(request)
    return cached ?? new Response('오프라인 상태입니다.', { status: 503 })
  }
}
