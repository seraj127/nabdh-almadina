import type { NextConfig } from "next";

const isBuild = process.env.BUILD_MOBILE === '1';

const nextConfig: NextConfig = {
  output: isBuild ? "export" : "standalone",
  ...(isBuild ? { skipTrailingSlashRedirect: true } : {}),
  reactStrictMode: false,
  devIndicators: false,
  typescript: { ignoreBuildErrors: true },
  ...(isBuild ? {
    typescript: { ignoreBuildErrors: true },
    images: { unoptimized: true },
  } : {}),
  turbopack: {
    root: "/home/z/my-project",
  },
  allowedDevOrigins: [
    'preview-chat-eab2da02-1033-444d-941f-34f38f266f82.space-z.ai',
    '.space-z.ai',
    'localhost',
  ],
  async headers() {
    if (isBuild) return [];
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; media-src 'self' blob: https:; frame-ancestors 'self' https://*.space-z.ai http://*.space-z.ai;"
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
    ];
  },
};

export default nextConfig;
