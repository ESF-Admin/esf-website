/**
 * One-time migration: seeded `page`, `ministry` and `missionCountry`
 * documents were created with dotted IDs ("page.history",
 * "ministry.evangelism"). Sanity treats any ID containing a dot as private,
 * so the site's tokenless public client never saw them and every page fell
 * back to lib/content.ts. This copies each one to a dot-free ID
 * ("page-history", "ministry-evangelism") with its current content. `page`
 * documents also get lib/content.ts's pageSeoDefaults as their SEO fields
 * (the old SEO values were never live).
 *
 * Safe to re-run: existing new-ID documents are left untouched. The old
 * dotted documents are not deleted; list and remove them afterwards with
 *   npx sanity documents query '*[_id in path("page.*") || _id in path("ministry.*") || _id in path("missionCountry.*")]._id'
 *   npx sanity documents delete <id> <id> ...
 *
 *   npx sanity exec scripts/migrate-page-ids.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";
import { pageSeoDefaults } from "../lib/content";

const client = getCliClient();

type Doc = { _id: string; _type: string; slug?: keyof typeof pageSeoDefaults } & Record<string, unknown>;

async function run() {
  const docs = await client.fetch<Doc[]>(
    `*[_id in path("page.*") || _id in path("ministry.*") || _id in path("missionCountry.*")]`,
  );
  if (!docs.length) {
    console.log("No dotted IDs found — nothing to migrate.");
    return;
  }

  const tx = client.transaction();
  for (const doc of docs) {
    // Content fields only; system fields (_id, _rev, _createdAt, ...) are reset.
    const fields = Object.fromEntries(Object.entries(doc).filter(([k]) => !k.startsWith("_")));
    const newId = doc._id.replace(".", "-");
    tx.createIfNotExists({
      ...fields,
      _id: newId,
      _type: doc._type,
      ...(doc._type === "page" && doc.slug
        ? { seo: { _type: "seo", ...pageSeoDefaults[doc.slug] } }
        : {}),
    });
    console.log(`${doc._id} → ${newId}`);
  }
  await tx.commit();
  console.log(`Done: ${docs.length} documents copied.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
