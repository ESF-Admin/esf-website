/**
 * Decorative stained-glass arch. Inline SVG (not a bitmap) so it inherits the
 * theme tokens and stays crisp — and so the page ships no third-party assets.
 */
export function ArchArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 460"
      className={className}
      role="img"
      aria-label="Illustration of a stained-glass window arch"
    >
      <defs>
        <clipPath id="esf-arch">
          <path d="M170 6c78 0 142 64 142 142v300H28V148C28 70 92 6 170 6z" />
        </clipPath>
        <linearGradient id="esf-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--band)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--band)" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="esf-g2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <g clipPath="url(#esf-arch)">
        <rect width="340" height="460" fill="var(--surface-2)" />
        <circle cx="170" cy="150" r="118" fill="url(#esf-g1)" />
        <path d="M28 300h284v160H28z" fill="url(#esf-g2)" opacity="0.35" />
        <path d="M28 330 170 236l142 94v130H28z" fill="url(#esf-g1)" opacity="0.5" />
        <circle cx="170" cy="150" r="58" fill="var(--on-band)" opacity="0.18" />
        {/* cross */}
        <rect x="162" y="96" width="16" height="118" rx="4" fill="var(--on-band)" opacity="0.92" />
        <rect x="126" y="132" width="88" height="16" rx="4" fill="var(--on-band)" opacity="0.92" />
        {/* leading */}
        <g stroke="var(--background)" strokeWidth="4" opacity="0.7">
          <path d="M28 236h284M28 330h284M170 6v454M99 60v400M241 60v400" />
        </g>
      </g>

      <path
        d="M170 6c78 0 142 64 142 142v300H28V148C28 70 92 6 170 6z"
        fill="none"
        stroke="var(--border)"
        strokeWidth="4"
      />
    </svg>
  );
}
