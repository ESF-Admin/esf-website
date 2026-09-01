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
};

export default nextConfig;
