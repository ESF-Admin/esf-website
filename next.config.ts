import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sanity Studio is a browser-only SPA. Left un-externalized, the RSC
  // bundler tree-walks its full dependency graph (including swr, which has
  // no default export under the "react-server" condition) and the build
  // fails. Externalizing skips static analysis of these packages entirely.
  serverExternalPackages: ["sanity", "@sanity/vision", "styled-components"],
};

export default nextConfig;
