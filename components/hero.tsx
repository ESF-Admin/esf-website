"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { hero } from "@/lib/content";
import { ArchArt } from "./arch-art";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();
  const titleWords = hero.title.split(" ");
  const titleLead = titleWords.slice(0, -1).join(" ");
  const titleLast = titleWords[titleWords.length - 1];

  const parent = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.1 } },
  };
  const child = reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      };

  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28"
    >
      {/* Ambient background motion — decorative only. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="esf-blob absolute -top-40 -left-32 size-[36rem] rounded-full bg-primary/15 blur-3xl" />
        <div
          className="esf-blob absolute -right-24 top-24 size-[30rem] rounded-full bg-accent/15 blur-3xl"
          style={{ animationDelay: "-7s" }}
        />
        <div
          className="esf-blob absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-primary/10 blur-3xl"
          style={{ animationDelay: "-14s" }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr]">
        <motion.div initial="hidden" animate="show" variants={parent}>
          <motion.p
            variants={child}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-muted-foreground"
          >
            <MapPin aria-hidden className="size-4 text-accent" />
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            variants={child}
            id="home-heading"
            className="mt-6 text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl"
          >
            {titleLead ? `${titleLead} ` : ""}
            <span className="esf-gradient-text">{titleLast}</span>
          </motion.h1>

          <motion.p
            variants={child}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl"
          >
            {hero.body}
          </motion.p>

          <motion.div variants={child} className="mt-9 flex flex-wrap gap-3">
            <a
              href={hero.primaryCta.href}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              {hero.primaryCta.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>
            <a
              href={hero.secondaryCta.href}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 text-base font-semibold text-foreground transition-colors duration-200 hover:bg-surface-2"
            >
              {hero.secondaryCta.label}
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="mx-auto w-full max-w-sm lg:max-w-none"
        >
          <ArchArt className="h-auto w-full drop-shadow-xl" />
        </motion.div>
      </div>
    </section>
  );
}
