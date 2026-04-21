/** @type {import('next').NextConfig} */
const nextConfig = {
  // Design Ref: §2.1 — PWA 오프라인 지원
  experimental: {},
  // 항상 최신 번들 — 브라우저 캐시 무효화
  generateEtags: false,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store, must-revalidate' },
      ],
    },
  ],
}

export default nextConfig
