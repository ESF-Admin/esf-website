"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/lib/content";
import { Section } from "./section";

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduced = useReducedMotion();
  const items = testimonials.items;

  const go = (step: number) => {
    setDirection(step);
    setIndex((i) => (i + step + items.length) % items.length);
  };

  const current = items[index];
  const offset = reduced ? 0 : 40;

  return (
    <Section
      id="stories"
      title={testimonials.title}
      subtitle={testimonials.subtitle}
      placeholder={testimonials.placeholder}
      tinted
    >
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Student stories"
        className="relative rounded-3xl border border-border bg-surface p-6 sm:p-12"
      >
        <Quote aria-hidden className="size-8 text-accent" />

        <div className="mt-6 min-h-[13rem] sm:min-h-[11rem]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, x: direction * offset }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -offset }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xl leading-relaxed text-pretty sm:text-2xl sm:leading-relaxed">
                {current.quote}
              </p>
              <footer className="mt-6">
                <p className="font-semibold">{current.name}</p>
                <p className="text-sm text-muted-foreground">{current.role}</p>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          <ul className="flex items-center -ml-3">
            {items.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Show story ${i + 1} of ${items.length}`}
                  aria-current={i === index ? "true" : undefined}
                  className="grid size-11 cursor-pointer place-items-center rounded-full"
                >
                  {/* 10px dot inside a 44px hit area */}
                  <span
                    aria-hidden
                    className={`block size-2.5 rounded-full transition-colors duration-200 ${
                      i === index ? "bg-accent" : "bg-border"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous story"
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-border transition-colors duration-200 hover:bg-surface-2"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next story"
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-border transition-colors duration-200 hover:bg-surface-2"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
