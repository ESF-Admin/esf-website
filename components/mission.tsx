import { Quote } from "lucide-react";
import { mission } from "@/lib/content";
import { Reveal } from "./reveal";

export function Mission() {
  return (
    <section
      id="mission"
      aria-labelledby="mission-heading"
      className="relative isolate scroll-mt-24 overflow-hidden bg-gradient-to-br from-band via-band to-primary py-20 text-on-band sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 -z-10 size-[28rem] rounded-full bg-accent/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 -z-10 size-[24rem] rounded-full bg-primary/30 blur-3xl"
      />
      <div className="mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <Quote aria-hidden className="mx-auto size-9 opacity-70" />
          <h2
            id="mission-heading"
            className="mt-6 font-display text-sm font-bold tracking-[0.2em] uppercase opacity-80"
          >
            {mission.title}
          </h2>
          <p className="mt-6 text-2xl leading-snug font-medium text-balance sm:text-3xl md:text-[2.1rem] md:leading-[1.3]">
            {mission.statement}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
