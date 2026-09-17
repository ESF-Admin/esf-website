import { Studio } from "./Studio";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function InternalStudioPage() {
  return <Studio />;
}
