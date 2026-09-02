"use client";

import { Navigation } from "lucide-react";

type Props = {
  address: string;
  className?: string;
};

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

/**
 * Platform-aware directions link.
 *
 * iOS: there's no web API to ask "is app X installed", so this uses the
 * standard workaround — try Google Maps' custom URL scheme, and only fall
 * back to Apple Maps if the OS never handed off to an app. The fallback
 * is driven by `visibilitychange`, not a fixed timer: a timer alone can
 * misfire when Google Maps is already running (bringing an already-open
 * app to the foreground can take a beat longer than launching it fresh),
 * firing the Apple Maps fallback even though the handoff was about to
 * succeed. Watching for the tab actually going hidden — however long
 * that takes, up to a generous cap — fixes that false fallback.
 *
 * Android hands off to the Google Maps app automatically via App Links;
 * no fallback needed.
 *
 * Desktop: opens Google Maps directions synchronously, in the same tick
 * as the click. An earlier version tried to fetch geolocation first and
 * redirect an already-opened blank tab once it resolved — window.open()
 * must happen inside the click's own call stack to avoid being
 * popup-blocked, and browsers are inconsistent about honoring a
 * *navigation* of that tab from later, asynchronous code (some silently
 * drop it, leaving a permanently blank tab — which is exactly what broke
 * before). Opening the final URL immediately sidesteps that whole class
 * of failure. Google Maps' own page already offers "use my location" —
 * that's the one place a location prompt belongs.
 */
function openDirections(address: string) {
  const encoded = encodeURIComponent(address);

  if (isIOS()) {
    let handedOff = false;
    const onHide = () => {
      handedOff = true;
    };
    document.addEventListener("visibilitychange", onHide, { once: true });

    window.location.href = `comgooglemaps://?daddr=${encoded}&x-source=ESF+Website`;

    setTimeout(() => {
      document.removeEventListener("visibilitychange", onHide);
      if (!handedOff) {
        window.location.href = `https://maps.apple.com/?daddr=${encoded}&dirflg=d`;
      }
    }, 1500);
    return;
  }

  if (isAndroid()) {
    window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    return;
  }

  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export function GetDirectionsButton({ address, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={() => openDirections(address)}
      className={`group inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110 ${className}`}
    >
      <Navigation aria-hidden className="size-4" />
      Get Directions
    </button>
  );
}
