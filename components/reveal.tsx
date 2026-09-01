"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/** Shared scroll-triggered entrance. Every section uses this — one motion contract. */

const EASE = [0.22, 1, 0.36, 1] as const;

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const still: Variants = { hidden: { opacity: 1 }, show: { opacity: 1 } };

type Props = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before this element's own transition starts. */
  delay?: number;
  as?: "div" | "li" | "ul" | "ol" | "section" | "article" | "span";
};

export function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduced ? undefined : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={reduced ? still : item}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

/** Wrap a group whose children should stagger in. Children use <Reveal.Item>. */
export function RevealGroup({ children, className, as = "div" }: Props) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduced ? undefined : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={reduced ? still : container}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ children, className, as = "div" }: Props) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag className={className} variants={reduced ? still : item}>
      {children}
    </Tag>
  );
}
