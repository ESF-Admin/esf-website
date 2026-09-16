import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image } from "sanity";
import { projectId, dataset } from "@/sanity/env";

/**
 * The shape any GROQ query must project for an `imageWithAlt` field to be
 * usable by <SanityImage>: the raw image (asset ref + optional hotspot/crop,
 * via `...`) plus `alt`/`caption` and the two computed fields next/image
 * needs up front — `dim` (intrinsic width/height) and `lqip` (blur
 * placeholder) — both only obtainable by dereferencing the asset.
 */
export type SanityImageData = Image & {
  alt: string;
  caption?: string;
  dim?: { width: number; height: number };
  lqip?: string;
};

let builder: ReturnType<typeof createImageUrlBuilder> | null | undefined;

/**
 * Same never-throw contract as getSanityClient(): returns null instead of
 * throwing until a Sanity project is configured, so any component calling
 * this can degrade to rendering nothing rather than crashing the page.
 */
function getBuilder() {
  if (builder !== undefined) return builder;
  builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null;
  return builder;
}

export function urlFor(source: Image) {
  return getBuilder()?.image(source) ?? null;
}
