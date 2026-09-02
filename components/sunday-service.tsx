import { MapPin } from "lucide-react";
import { org, service } from "@/lib/content";
import { Reveal } from "./reveal";
import { GetDirectionsButton } from "./get-directions-button";

export function SundayService() {
  return (
    <section
      id="sunday-service"
      aria-labelledby="sunday-service-heading"
      className="relative isolate overflow-hidden bg-gradient-to-br from-band via-band to-primary text-on-band"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 -z-10 size-[28rem] rounded-full bg-accent/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 -z-10 size-[24rem] rounded-full bg-primary/25 blur-3xl"
      />
      <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <Reveal>
          <p className="text-sm font-bold tracking-[0.24em] uppercase opacity-80">
            {service.day} Service
          </p>
          <h2
            id="sunday-service-heading"
            className="mt-4 text-4xl font-semibold text-balance sm:text-5xl"
          >
            We meet every {service.day} at{" "}
            <span className="whitespace-nowrap">{service.time}</span>
          </h2>
          <p className="mt-4 text-xl leading-relaxed opacity-90 text-pretty">
            {service.note}
          </p>

          <a
            href={org.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex max-w-xs cursor-pointer items-start gap-2.5 text-left text-lg leading-snug opacity-90 transition-opacity duration-200 hover:opacity-100 sm:max-w-none"
          >
            <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
            {org.address}
          </a>

          <div className="mt-8">
            <GetDirectionsButton address={org.address} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
