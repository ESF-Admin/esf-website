import { Church, HandHeart, BookOpenText, Baby, Globe2, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The closed set of icons a `ministry` document can pick from. Plain
 * strings, importable by the Sanity schema (sanity/schemaTypes/ministry.ts)
 * without pulling `lucide-react` (or `sanity`) into the wrong bundle.
 */
export const ICON_NAMES = [
  "church",
  "handHeart",
  "book",
  "baby",
  "globe",
  "users",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const ICONS: Record<IconName, LucideIcon> = {
  church: Church,
  handHeart: HandHeart,
  book: BookOpenText,
  baby: Baby,
  globe: Globe2,
  users: Users,
};

/**
 * The only place a ministry's `icon` string is turned into a component —
 * never index into a lucide namespace with raw CMS input. Falls back to a
 * sane default so a document created before this field existed (or an
 * unrecognized value) still renders something instead of crashing.
 */
export function iconFor(name: string): LucideIcon {
  return ICONS[name as IconName] ?? Church;
}
