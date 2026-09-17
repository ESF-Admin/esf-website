"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { ArchArt } from "./arch-art";
import { safeHref } from "@/lib/href";

const EASE = [0.22, 1, 0.36, 1] as const;

type Cta = { label: string; href: string };

type Video = { url: string; posterUrl: string } | null;

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  video: Video;
};

export function HeroClient({ eyebrow, title, body, primaryCta, secondaryCta, video }: Props) {
  const reduced = useReducedMotion();
  const titleWords = title.split(" ");
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
      {video ? (
        // A video's own brightness/contrast can't be predicted, so the
        // overlay forces light text regardless of the site's light/dark
        // theme — the theme-adaptive colors below are only used when
        // there's no video and the background is the plain page surface.
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-neutral-900">
          {reduced ? (
            // Reduced-motion visitors get the still poster, never the video file.
            <Image src={video.posterUrl} alt="" fill sizes="100vw" className="object-cover" />
          ) : (
            <video
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              poster={video.posterUrl}
              className="size-full object-cover"
            >
              <source src={video.url} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/25" />
          {/* The fixed nav has no background of its own until the page scrolls — darken behind it so its text/logo stay readable over the video from the very top. */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        </div>
      ) : (
        // Ambient background motion — decorative only, shown when no video is set.
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="esf-blob absolute -top-40 -left-32 size-[36rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="esf-blob absolute -right-24 top-24 size-[30rem] rounded-full bg-accent/15 blur-3xl [animation-delay:-7s]" />
          <div className="esf-blob absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-primary/10 blur-3xl [animation-delay:-14s]" />
        </div>
      )}

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr]">
        <motion.div initial="hidden" animate="show" variants={parent}>
          <motion.p
            variants={child}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
              video
                ? "border-white/30 bg-white/10 text-white backdrop-blur-sm"
                : "border-border bg-surface text-muted-foreground"
            }`}
          >
            <MapPin aria-hidden className={`size-4 ${video ? "text-white" : "text-accent"}`} />
            {eyebrow}
          </motion.p>

          <motion.h1
            variants={child}
            id="home-heading"
            className={`mt-6 text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl ${
              video ? "text-white" : ""
            }`}
          >
            {titleLead ? `${titleLead} ` : ""}
            <span className="esf-gradient-text">{titleLast}</span>
          </motion.h1>

          <motion.p
            variants={child}
            className={`mt-6 max-w-xl text-lg leading-relaxed text-pretty sm:text-xl ${
              video ? "text-white/85" : "text-muted-foreground"
            }`}
          >
            {body}
          </motion.p>

          <motion.div variants={child} className="mt-9 flex flex-wrap gap-3">
            <a
              href={safeHref(primaryCta.href)}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              {primaryCta.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>
            <a
              href={safeHref(secondaryCta.href)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-6 py-3.5 text-base font-semibold transition-colors duration-200 ${
                video
                  ? "border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  : "border-border bg-surface text-foreground hover:bg-surface-2"
              }`}
            >
              {secondaryCta.label}
            </a>
          </motion.div>
        </motion.div>

        {!video && (
          <motion.div
            initial={reduced ? undefined : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="mx-auto w-full max-w-sm lg:max-w-none"
          >
            <ArchArt className="h-auto w-full drop-shadow-xl" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
