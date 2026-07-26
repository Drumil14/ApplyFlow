import type { SVGProps } from "react";

/**
 * ApplyFlow "Ascent" mark: three rising stages (Applied → Interview → Offer).
 * Monochrome — draws with `currentColor`, so it adapts to whatever text color
 * the surrounding container sets (works on both the dark and light themes).
 */
export function ApplyFlowMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="ApplyFlow"
      className={className}
      {...props}
    >
      <rect x="4" y="18" width="6" height="9" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="13" y="12" width="6" height="15" rx="2" fill="currentColor" opacity="0.78" />
      <rect x="22" y="6" width="6" height="21" rx="2" fill="currentColor" />
    </svg>
  );
}
