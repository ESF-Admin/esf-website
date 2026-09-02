import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

  async headers() {
    return [
      {
        // Skip /studio — Sanity's own bundle needs inline scripts/styles
        // and frames itself for previews; a locked-down CSP there breaks it.
        source: "/((?!studio).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "connect-src 'self' https://*.sanity.io",
              "img-src 'self' data: https://cdn.sanity.io",
              "frame-src 'self' https://view.officeapps.live.com https://*.sanity.io",
              // React dev mode calls eval() for its debugging tools — never
              // in production, so 'unsafe-eval' is dev-only, not a prod hole.
              `script-src 'self' 'unsafe-inline'${
                process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
              }`,
              "style-src 'self' 'unsafe-inline'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
