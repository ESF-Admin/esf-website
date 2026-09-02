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
 * Platform-aware directions link. There's no web API to ask "is app X
 * installed" — the iOS branch uses the standard workaround: try Google
 * Maps' own custom URL scheme, and if the tab is still visible a moment
 * later (the OS never handed off to an app), fall back to Apple Maps,
 * which is always present. Android and desktop don't need a fallback:
 * Android's Google Maps App Links degrade to the website automatically,
 * and desktop opens Google Maps in a new tab either way.
 */
function openDirections(address: string) {
  const encoded = encodeURIComponent(address);

  if (isIOS()) {
    const before = Date.now();
    window.location.href = `comgooglemaps://?daddr=${encoded}&x-source=ESF+Website`;
    setTimeout(() => {
      // Only fall back if we're still here — a successful handoff to the
      // Google Maps app backgrounds this tab, pausing this timer with it.
      if (Date.now() - before < 2000) {
        window.location.href = `https://maps.apple.com/?daddr=${encoded}&dirflg=d`;
      }
    }, 1200);
    return;
  }

  if (isAndroid()) {
    window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    return;
  }

  // Desktop: ask for the visitor's location right at the click (not on page
  // load) to pre-fill the starting point; Google Maps itself handles the
  // "enter your location" flow if permission is denied or unavailable.
  //
  // window.open() must run synchronously inside the click handler or
  // browsers silently block it as a popup — geolocation is async, so we
  // can't wait for it before opening. Instead, open the tab right now (it's
  // still inside the click's call stack) and redirect that already-open
  // window once we know the origin; redirecting an existing window isn't
  // subject to popup blocking.
  const tab = window.open("", "_blank", "noreferrer");
  const goTo = (origin?: string) => {
    const params = new URLSearchParams({ api: "1", destination: address });
    if (origin) params.set("origin", origin);
    const url = `https://www.google.com/maps/dir/?${params}`;
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noreferrer");
  };

  if (!navigator.geolocation) {
    goTo();
    return;
  }

  const fallback = setTimeout(() => goTo(), 2500);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      clearTimeout(fallback);
      goTo(`${pos.coords.latitude},${pos.coords.longitude}`);
    },
    () => {
      clearTimeout(fallback);
      goTo();
    },
    { timeout: 2500 },
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
