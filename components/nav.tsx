"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { navLinks, org, type NavLink } from "@/lib/content";
import { ThemeToggle } from "./theme-toggle";

const EASE = [0.22, 1, 0.36, 1] as const;

// Active when the path matches exactly, or sits under this link's route
// (e.g. "/bulletins/view" stays under "Bulletins"). Home ("/") only matches
// itself — otherwise every route would count as a prefix of it.
function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Which top-level mobile item has its sublist expanded.
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-border bg-background/75 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-md"
          aria-label={`${org.name} — home`}
        >
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-on-primary shadow-lg shadow-primary/25"
          >
            ESF
          </span>
          <span className="hidden font-display text-base leading-tight font-semibold sm:block">
            Evangelical Student
            <br />
            Fellowship
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <DesktopItem key={link.href} link={link} pathname={pathname} />
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/contact"
            className="hidden cursor-pointer rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-on-primary shadow-md shadow-primary/20 outline-none transition-[filter,transform] duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary/50 lg:inline-block"
          >
            Get in touch
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 cursor-pointer place-items-center rounded-full border border-border bg-surface outline-none transition-colors duration-200 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-primary/50 lg:hidden"
          >
            {open ? (
              <X aria-hidden className="size-5" />
            ) : (
              <Menu aria-hidden className="size-5" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="mx-auto flex max-h-[70vh] max-w-6xl flex-col gap-1 overflow-y-auto px-5 py-4">
              {navLinks.map((link) => {
                const expanded = mobileExpanded === link.href;
                return (
                  <li key={link.href}>
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={
                          isActivePath(pathname, link.href) ? "true" : undefined
                        }
                        className="block flex-1 rounded-xl px-4 py-3 text-base font-medium text-foreground hover:bg-surface-2"
                      >
                        {link.label}
                      </Link>
                      {link.children && (
                        <button
                          type="button"
                          onClick={() =>
                            setMobileExpanded(expanded ? null : link.href)
                          }
                          aria-expanded={expanded}
                          aria-label={`${expanded ? "Hide" : "Show"} ${link.label} options`}
                          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full"
                        >
                          <ChevronDown
                            aria-hidden
                            className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                    {link.children && (
                      <AnimatePresence>
                        {expanded && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: EASE }}
                            className="ml-4 flex flex-col gap-0.5 overflow-hidden border-l border-border pl-4"
                          >
                            {link.children.map((child) => (
                              <li key={child.label}>
                                <Link
                                  href={child.href}
                                  onClick={() => setOpen(false)}
                                  className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mx-auto max-w-6xl px-5 pb-6">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block cursor-pointer rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3 text-center text-sm font-semibold text-on-primary shadow-md shadow-primary/20"
              >
                Get in touch
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DesktopItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const isActive = isActivePath(pathname, link.href);

  return (
    <li className="group relative">
      <Link
        href={link.href}
        aria-current={isActive ? "true" : undefined}
        aria-haspopup={link.children ? "true" : undefined}
        className={`relative flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        }`}
      >
        {isActive && (
          <motion.span
            layoutId="nav-pill"
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-surface-2 ring-1 ring-primary/15"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
        {link.label}
        {link.children && (
          <ChevronDown
            aria-hidden
            className="size-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
          />
        )}
      </Link>

      {link.children && (
        <div
          className="invisible absolute top-full left-1/2 z-50 w-max min-w-44 -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        >
          <ul className="grid max-w-xs grid-cols-1 gap-0.5 rounded-2xl border border-border bg-surface/95 p-2 shadow-xl shadow-primary/10 backdrop-blur-xl [&:has(li:nth-child(6))]:grid-cols-2">
            {link.children.map((child) => (
              <li key={child.label}>
                <Link
                  href={child.href}
                  className="block rounded-lg px-3.5 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-150 hover:bg-accent-soft hover:text-foreground"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
