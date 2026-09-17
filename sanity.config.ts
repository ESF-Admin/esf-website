import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { contactSubmission } from "./sanity/schemaTypes/contact-submission";
import { structure, SINGLETON_TYPES } from "./sanity/structure";

const siteWorkspace = defineConfig({
  name: "default",
  title: "ESF website",
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

// Separate workspace, separate (private) dataset — contact form submissions
// carry visitor PII and must never live in the public "production" dataset
// (see lib/sanity/client.ts's public, tokenless CDN read). This workspace is
// the admin UI for that data only; its schema deliberately excludes every
// public-site content type.
const internalWorkspace = defineConfig({
  name: "internal",
  title: "ESF website — Internal (contact submissions)",
  basePath: "/studio/internal",
  projectId,
  dataset: "internal",
  schema: { types: [contactSubmission] },
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});

const workspaces = [siteWorkspace, internalWorkspace];

export default workspaces;
