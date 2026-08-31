/** Inset top highlight — bright white edge in light mode, soft glow in dark */
export const glassTop =
  'shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.18)]';

export const glassTopLime =
  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65),0_1px_2px_rgba(0,0,0,0.06)]';

export const glassTopOnDark =
  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.2)]';

/** Light = pale fill + hairline border; dark = borderless translucent glass */
export const glassSurface =
  'border border-black/[0.06] bg-black/[0.04] hover:bg-black/[0.06] dark:border-0 dark:bg-white/10 dark:hover:bg-white/15';

export const glassButton =
  `inline-flex items-center justify-center transition-colors ${glassSurface} ${glassTop}`;

export const glassButtonPill =
  `inline-flex items-center justify-center rounded-full transition-colors ${glassSurface} ${glassTop}`;

export const glassCard =
  `transition-colors ${glassSurface} ${glassTop}`;

export const glassIconButton =
  `inline-flex shrink-0 items-center justify-center rounded-lg transition-colors ${glassSurface} ${glassTop}`;

/** Solid invert pill — black in light, white in dark, with glass top highlight */
export const glassInvertPill =
  'inline-flex items-center justify-center rounded-full border-0 bg-black text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.06)] dark:hover:bg-white/95';
