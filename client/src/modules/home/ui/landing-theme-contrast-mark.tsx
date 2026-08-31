'use client';

import { useId } from 'react';

/** Half-outline / half-hatched circle — contrast theme mark */
export function LandingThemeContrastMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `theme-clip-${uid}`;
  const hatchId = `theme-hatch-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="12" y="3.75" width="8.25" height="16.5" />
        </clipPath>
        <pattern
          id={hatchId}
          width="2.75"
          height="2.75"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(40)"
        >
          <line x1="0" y1="0" x2="0" y2="2.75" stroke="currentColor" strokeWidth="1.15" />
        </pattern>
      </defs>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="8.25" fill={`url(#${hatchId})`} clipPath={`url(#${clipId})`} />
    </svg>
  );
}
