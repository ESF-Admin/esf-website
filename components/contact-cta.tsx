import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHomePage } from "@/lib/sanity/queries";
import { Reveal } from "./reveal";

/** Closing homepage CTA — the full contact form lives at /contact. */
export async function ContactCta() {
  const { contactCta } = await getHomePage();

  return (
    <section aria-labelledby="contact-cta-heading" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 text-center sm:px-8">
        <Reveal>
          <h2
            id="contact-cta-heading"
            className="text-3xl font-semibold text-balance sm:text-4xl"
          >
            {contactCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {contactCta.subtitle}
          </p>
          <Link
            href={contactCta.cta.href}
            className="group mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110"
          >
            {contactCta.cta.label}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
