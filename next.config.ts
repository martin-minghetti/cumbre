import type { NextConfig } from 'next';

const cspProd = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.mercadopago.com https://sdk.mercadopago.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.mercadopago.com https://http2.mlstatic.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.mercadopago.com https://api.resend.com",
  "frame-src https://www.mercadopago.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://www.mercadopago.com",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const cspDev = cspProd
  .replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'")
  .replace("connect-src 'self'", "connect-src 'self' ws: http://localhost:* http://127.0.0.1:*");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  poweredByHeader: false,
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: isProd ? cspProd : cspDev },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          ...(isProd
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
