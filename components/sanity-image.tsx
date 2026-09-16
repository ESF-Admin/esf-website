import Image from "next/image";
import { urlFor, type SanityImageData } from "@/lib/sanity/image";

export type { SanityImageData };

type Props = {
  image: SanityImageData | null | undefined;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Wraps next/image over a Sanity image field. Degrades to rendering
 * nothing — never a broken image or a crash — when Sanity isn't
 * configured, the field is empty, or the asset's dimensions weren't
 * projected (next/image requires width/height up front). `alt` has no
 * `?? ""` fallback here: the `imageWithAlt` schema makes it required, so
 * an image reaching this component without one is a data bug to fix at
 * the source, not paper over with an empty alt.
 */
export function SanityImage({ image, sizes, priority, className }: Props) {
  if (!image?.dim) return null;
  const builder = urlFor(image);
  if (!builder) return null;

  return (
    <Image
      src={builder.width(image.dim.width).fit("max").auto("format").url()}
      alt={image.alt}
      width={image.dim.width}
      height={image.dim.height}
      sizes={sizes}
      priority={priority}
      className={className}
      placeholder={image.lqip ? "blur" : "empty"}
      blurDataURL={image.lqip}
    />
  );
}
