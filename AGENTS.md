<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes

- Read `PROJECT_CONTEXT.md` before any non-trivial change; it and the code are the source of truth.
- When a change affects the stack, routes, data model, env vars, deployment or a documented decision, update the matching section of `PROJECT_CONTEXT.md` and add one line to its Changelog. Update `README.md` if setup, commands or the admin workflow change.
- After a Sanity schema change, run `npm run sanity:typegen` and commit `sanity.types.ts`.
- Before finishing: `npm run typecheck`, `npm run lint`, `npm test`.
