import { getHomePage, getTestimonials } from "@/lib/sanity/queries";
import { TestimonialsClient } from "./testimonials-client";

/** Server wrapper — fetches CMS-driven stories + section copy, hands off to the client carousel. */
export async function Testimonials() {
  const [{ testimonials }, items] = await Promise.all([
    getHomePage(),
    getTestimonials(),
  ]);

  return (
    <TestimonialsClient
      title={testimonials.title}
      subtitle={testimonials.subtitle}
      placeholder={testimonials.showPlaceholderBadge}
      items={items}
    />
  );
}
