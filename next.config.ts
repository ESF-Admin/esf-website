import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No point advertising the framework to every request — pure
  // reconnaissance value for an attacker, zero benefit to a visitor.
  poweredByHeader: false,

  // Only `swr` needs externalizing: sanity's validationUtils imports it, and
  // swr has no default export under the "react-server" condition, which
  // crashes the RSC bundler's static analysis. Externalizing `sanity` itself
  // (an earlier attempt) also "fixed" that build error, but broke Studio at
  // runtime — externalized code resolves its own `require("react")` outside
  // Next's bundler-aliased React, so `react-compiler-runtime` (pulled in by
  // @sanity/sdk-react) reads a different React instance and crashes with
  // "Cannot read properties of null (reading 'useMemoCache')". Externalizing
  // only `swr` avoids the build crash without breaking Studio's React tree.
  serverExternalPackages: ["swr"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
    ],
  },

  async headers() {
    return [
      {
        // Skip /studio and /internal — both are Sanity Studio workspaces
        // whose bundle needs inline scripts/styles and frames itself for
        // previews; a locked-down CSP there breaks it.
        source: "/((?!studio|internal).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "connect-src 'self' https://*.sanity.io https://www.google.com",
              "img-src 'self' data: https://cdn.sanity.io",
              "media-src 'self' https://cdn.sanity.io",
              // reCAPTCHA v3 renders an invisible verification iframe even
              // with no visible challenge — frame-src must allow it.
              "frame-src 'self' https://view.officeapps.live.com https://*.sanity.io https://www.google.com/recaptcha/",
              // React dev mode calls eval() for its debugging tools — never
              // in production, so 'unsafe-eval' is dev-only, not a prod hole.
              `script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/${
                process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
              }`,
              "style-src 'self' 'unsafe-inline'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
