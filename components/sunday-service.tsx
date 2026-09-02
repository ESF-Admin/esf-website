import { MapPin } from "lucide-react";
import { org, service } from "@/lib/content";
import { Reveal } from "./reveal";
import { GetDirectionsButton } from "./get-directions-button";

export function SundayService() {
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(org.address)}&output=embed`;

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
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
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
            className="mt-6 inline-flex cursor-pointer items-start gap-2.5 text-lg leading-snug opacity-90 transition-opacity duration-200 hover:opacity-100"
          >
            <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
            {org.address}
          </a>

          <div className="mt-8">
            <GetDirectionsButton address={org.address} />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="aspect-4/3 overflow-hidden rounded-3xl border border-white/15 shadow-2xl sm:aspect-video lg:aspect-square">
            <iframe
              title={`Map showing ${org.name}'s location`}
              src={mapEmbedSrc}
              loading="lazy"
              className="size-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
