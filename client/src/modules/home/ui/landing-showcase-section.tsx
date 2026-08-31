'use client';

import { motion } from 'framer-motion';

import { Check } from '@/components/icons';
import { PlanPillBadge } from '@/components/logo';
import { interTight } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

import { AnimatedWords } from './landing-animated-words';
import { LandingVerticalPill, useFeatureCarousel } from './landing-hero-visual';
import { MeshFeaturePreview } from './landing-mesh-previews';

const MARQUEE_KEYS = [
  'reading',
  'writing',
  'streaks',
  'placement',
  'feedback',
  'levels',
  'practice',
] as const;

const PRO_FEATURE_KEYS = [
  'unlimited',
  'writingFeedback',
  'placement',
  'reading',
  'streaks',
  'reports',
] as const;

function ProFeatureRow({ keys, delayStart }: { keys: readonly (typeof PRO_FEATURE_KEYS)[number][]; delayStart: number }) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-3 md:gap-x-3 md:gap-y-0">
      {keys.map((key, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: delayStart + i * 0.05 }}
          className="flex min-w-0 items-start gap-1.5 md:items-center md:gap-2"
        >
          <Check className="mt-0.5 size-3 shrink-0 text-white/80 md:mt-0 md:size-3.5" strokeWidth={2.5} />
          <span className="text-[10px] font-medium leading-tight text-white/70 md:text-[11px]">
            {t(`landing.promo.showcase.proFeatures.${key}`)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function MarqueeGroup() {
  const { t } = useI18n();

  return (
    <>
      {MARQUEE_KEYS.map((key) => (
        <span
          key={key}
          className="shrink-0 pr-8 text-xs font-semibold tracking-wide text-white/90 md:text-sm md:pr-10"
        >
          {t(`landing.promo.showcase.marquee.${key}`)}
        </span>
      ))}
    </>
  );
}

export function LandingShowcaseSection() {
  const { t } = useI18n();
  const { activeIndex, setActiveIndex } = useFeatureCarousel(0);

  return (
    <section id="showcase" className={cn(interTight.className, 'pb-6 md:pb-8')}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1], delay: 1.1 }}
        className="mesh-showcase flex min-h-0 flex-col overflow-hidden rounded-[20px] p-3.5 sm:rounded-[24px] sm:p-4 md:min-h-[22rem] md:rounded-[28px] md:p-5 lg:min-h-[24rem] lg:p-6"
      >
        <div className="grid flex-1 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-4 lg:min-h-[14rem]">
          {/* Pro card */}
          <motion.article
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 1.25 }}
            className="flex min-h-0 flex-col rounded-[18px] bg-[#1E1D19]/95 p-3.5 text-white shadow-[0_10px_32px_rgba(0,0,0,0.22)] sm:p-4 md:min-h-0 md:rounded-[20px] md:p-5"
          >
            <PlanPillBadge label={t('common.pro')} variant="pro" className="w-fit self-start" />
            <h2 className="mt-2.5 text-base font-medium leading-[1.15] tracking-tight sm:mt-3 sm:text-lg md:mt-3.5 md:text-xl">
              <AnimatedWords text={t('landing.promo.showcase.titleLine1')} delayStart={1.35} stagger={0.03} />
              <br />
              <AnimatedWords text={t('landing.promo.showcase.titleLine2')} delayStart={1.45} stagger={0.03} />
            </h2>

            <div className="mt-3 flex flex-1 flex-col justify-center gap-2 sm:mt-4 sm:gap-2.5 md:mt-5 md:gap-3">
              <ProFeatureRow keys={PRO_FEATURE_KEYS.slice(0, 3)} delayStart={1.55} />
              <ProFeatureRow keys={PRO_FEATURE_KEYS.slice(3, 6)} delayStart={1.7} />
            </div>

            <p className="mt-auto pt-3 text-xs leading-[1.5] text-white/40 md:pt-4 md:text-sm">
              {t('landing.promo.showcase.bodyLine1')}
              {' '}
              {t('landing.promo.showcase.bodyLine2')}
            </p>
          </motion.article>

          {/* Pill + feature preview — horizontal pill on mobile, vertical from md */}
          <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-center md:gap-4 lg:min-h-[14rem]">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 1.3 }}
              className="w-full shrink-0 md:w-auto"
            >
              <LandingVerticalPill activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 1.35 }}
              className="w-full min-w-0 md:max-w-none md:flex-1"
            >
              <MeshFeaturePreview activeIndex={activeIndex} />
            </motion.div>
          </div>
        </div>

        {/* Trusted by */}
        <div className="mt-4 flex shrink-0 flex-col gap-3 pt-3 sm:mt-3 md:flex-row md:items-center md:justify-between md:pt-3.5">
          <p className="max-w-sm text-[10px] leading-snug text-white/70 md:text-xs">
            {t('landing.promo.trustedLine1')}
            {' '}
            {t('landing.promo.trustedLine2')}
          </p>
          <div
            className="min-w-0 w-full overflow-hidden md:max-w-[55%]"
            style={{
              maskImage:
                'linear-gradient(to right, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%)',
            }}
          >
            <div className="animate-marquee flex w-max items-center">
              <MarqueeGroup />
              <MarqueeGroup />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
