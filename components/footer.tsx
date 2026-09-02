import { Mail, MapPin, Phone } from "lucide-react";
import { navLinks, org } from "@/lib/content";
import { Socials } from "./socials";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-on-primary"
            >
              ESF
            </span>
            <span className="font-display text-base font-semibold">
              {org.name}
            </span>
          </div>
          <p className="mt-5 max-w-sm leading-relaxed text-muted-foreground text-pretty">
            An international Christian student ministry on college and university
            campuses worldwide, and a multi-ethnic ministry in Chicago.
          </p>
          <Socials className="mt-6" />
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold tracking-[0.12em] uppercase">
            Explore
          </h2>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-[0.12em] uppercase">
            Contact
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <a
                href={org.phoneHref}
                className="flex items-start gap-2.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                {org.phone}
              </a>
            </li>
            <li>
              <a
                href={org.emailHref}
                className="flex items-start gap-2.5 break-all text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                {org.email}
              </a>
            </li>
            <li>
              <a
                href={org.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                {org.address}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-5 py-6 text-sm text-muted-foreground sm:px-8">
          © {org.copyrightYear} {org.legalFooterName}
        </p>
      </div>
    </footer>
  );
}
