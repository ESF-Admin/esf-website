import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

/** Closing homepage CTA — the full contact form lives at /contact. */
export function ContactCta() {
  return (
    <section aria-labelledby="contact-cta-heading" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 text-center sm:px-8">
        <Reveal>
          <h2
            id="contact-cta-heading"
            className="text-3xl font-semibold text-balance sm:text-4xl"
          >
            Have a question? We&apos;d love to hear from you.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Reach out about a gathering, a ministry, or just to say hello.
          </p>
          <Link
            href="/contact"
            className="group mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110"
          >
            Get in touch
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
