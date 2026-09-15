import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure, SINGLETON_TYPES } from "./sanity/structure";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // Vision lets the admin poke at GROQ queries directly — dev/debug only.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // Singletons (see sanity/structure.ts) can't be duplicated, deleted, or
    // unpublished into non-existence, and don't show up in "create new".
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? prev.filter(
            (action) =>
              !["duplicate", "delete", "unpublish"].includes(action.action ?? ""),
          )
        : prev,
    newDocumentOptions: (prev) =>
      prev.filter((template) => !SINGLETON_TYPES.has(template.templateId)),
  },
});
