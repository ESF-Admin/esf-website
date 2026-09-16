"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Icon and label are swapped by the `.dark` class rather than by React state,
 * so the button renders identically on the server and never mismatches.
 */
export function ThemeToggle({ light }: { light?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`grid size-11 cursor-pointer place-items-center rounded-full border transition-colors duration-200 ${
        light
          ? "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          : "border-border bg-surface text-foreground hover:bg-surface-2"
      }`}
    >
      <Moon
        aria-hidden
        className="col-start-1 row-start-1 size-5 dark:hidden"
        strokeWidth={1.75}
      />
      <Sun
        aria-hidden
        className="col-start-1 row-start-1 hidden size-5 dark:block"
        strokeWidth={1.75}
      />
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:block">Switch to light mode</span>
    </button>
  );
}
