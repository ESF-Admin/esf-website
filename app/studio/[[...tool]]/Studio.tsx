"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

// Config is built and consumed entirely inside this client boundary — never
// passed in as a prop from the server. `defineConfig`'s output contains
// functions/React elements (icon components, resolvers), which aren't
// serializable across the Server → Client Component boundary.
export function Studio() {
  return <NextStudio config={config} />;
}
