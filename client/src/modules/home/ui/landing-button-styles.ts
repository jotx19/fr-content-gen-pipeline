export {
  glassTop as landingGlassTop,
  glassTopLime as landingGlassTopLime,
  glassSurface as landingGlassSurface,
  glassButtonPill as landingCtaOutlineBase,
} from '@/lib/glass-button-styles';

import {
  glassButtonPill,
  glassSurface,
  glassTop,
  glassTopLime,
} from '@/lib/glass-button-styles';

export const landingIconButtonClass =
  `inline-flex size-10 items-center justify-center rounded-full p-1.5 transition-colors ${glassSurface} ${glassTop}`;

export const landingCtaOutlineClass =
  `inline-flex rounded-full font-medium text-foreground transition-colors ${glassSurface} ${glassTop}`;

export const landingCtaPrimaryClass =
  `inline-flex rounded-full bg-[#DFFF4F] font-semibold text-[#111114] transition-transform hover:scale-[1.02] ${glassTopLime}`;

export const landingEyebrowClass =
  `inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 md:pr-3.5 ${glassSurface} ${glassTop}`;

export const landingSettingsPillClass =
  `inline-flex h-10 items-center gap-0.5 rounded-full py-1 pl-2.5 pr-1 ${glassSurface} ${glassTop}`;

export const landingSettingsPillButtonClass =
  'inline-flex size-8 items-center justify-center rounded-full border-0 bg-transparent shadow-none transition-colors hover:bg-black/[0.06] dark:bg-transparent dark:shadow-none dark:hover:bg-white/10';

export const landingSettingsPillSeparator =
  'h-1/2 w-px shrink-0 bg-black/10 dark:bg-white/15';
