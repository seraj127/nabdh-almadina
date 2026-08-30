import type { NextConfig } from 'next'
import path from 'path'

const isMobileBuild = process.env.BUILD_MOBILE === '1'
const capacitorServerUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL || ''

if (isMobileBuild && !capacitorServerUrl) {
  throw new Error('CAPACITOR_SERVER_URL or NEXT_PUBLIC_APP_URL is required for the mobile build')
}

const nextConfig: NextConfig = {
  // The mobile app loads the deployed Next.js server through Capacitor. It must
  // not use static export because this project contains dynamic API routes.
  output: isMobileBuild ? 'standalone' : process.env.VERCEL ? undefined : 'standalone',
  // Pin tracing to this project so a stray lockfile in a parent folder (e.g. D:\bun.lock)
  // cannot make the standalone output nest under the inferred workspace root.
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  devIndicators: false,
  // Types must be fixed, not hidden, in CI and release builds.
  typescript: { ignoreBuildErrors: false },
  ...(isMobileBuild ? { images: { unoptimized: true } } : {}),
  allowedDevOrigins: [
    'preview-chat-eab2da02-1033-444d-941f-34f38f266f82.space-z.ai',
    '.space-z.ai',
    'localhost',
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; media-src 'self' blob: https:; frame-ancestors 'self' https://*.space-z.ai http://*.space-z.ai;",
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
      {
        source: '/(.*)\\.html',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
