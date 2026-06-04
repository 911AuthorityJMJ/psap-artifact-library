import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Pragmatic Content-Security-Policy without per-request nonces. 'unsafe-inline'
// for script-src is required while Next injects un-nonced bootstrap scripts;
// everything else is pinned to same-origin. See SECURITY.md for the strict
// nonce-based upgrade path (proxy.ts) if/when it's warranted.
//  - 'unsafe-eval' is only needed in dev (React uses eval for debug output).
//  - upgrade-insecure-requests is prod-only so it can't interfere with http://localhost.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // HSTS only matters over HTTPS; send it in production only.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  // Drop the "X-Powered-By: Next.js" fingerprint.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
