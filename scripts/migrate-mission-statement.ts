/**
 * One-time migration: homePage.mission.statement changed from a plain
 * `text` field to `richText` (Phase 5). Converts an existing plain-string
 * value into the equivalent single-paragraph Portable Text block so it
 * isn't orphaned by the schema change. Safe to re-run — a no-op once the
 * field is already a block array.
 *
 *   npx sanity exec scripts/migrate-mission-statement.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

function toBlock(text: string) {
  return [
    {
      _type: "block",
      _key: "stmt",
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: "stmt-span", text, marks: [] }],
    },
  ];
}

async function run() {
  const doc = await client.fetch<{ mission?: { statement?: unknown } } | null>(
    `*[_id == "homePage"][0]{mission}`,
  );
  const current = doc?.mission?.statement;

  if (typeof current !== "string") {
    console.log("mission.statement is already rich text (or unset) — nothing to migrate.");
    return;
  }

  await client.patch("homePage").set({ "mission.statement": toBlock(current) }).commit();
  console.log("Migrated homePage.mission.statement to rich text.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
