'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { Logo } from '@/components/logo';
import { interTight } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

import { AnimatedWords } from './landing-animated-words';
import {
  landingCtaOutlineClass,
  landingCtaPrimaryClass,
  landingEyebrowClass,
} from './landing-button-styles';

export function LandingHeroSection() {
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ctaHref = isAuthenticated ? '/learn' : '/signin';

  return (
    <section
      className={cn(
        interTight.className,
        'mx-auto flex w-full max-w-[1050px] flex-col items-center justify-start px-2 pb-8 pt-14 text-center md:flex-1 md:pb-[30vh] md:pt-12',
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 }}
        className={landingEyebrowClass}
      >
        <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-card px-1.5 text-[9px] font-semibold leading-none tracking-wide text-foreground dark:bg-background md:h-6 md:min-w-6 md:px-2 md:text-[10px]">
          AI
        </span>
        <span className="text-[13px] leading-none text-foreground md:text-sm">{t('landing.promo.eyebrow')}</span>
      </motion.div>

      <h1
        id="landing-hero-heading"
        className="mx-auto mt-4 max-w-[1050px] text-[clamp(2.25rem,9vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.035em] text-foreground md:mt-5 md:text-[clamp(2rem,4.8vw,4.25rem)]"
      >
        <AnimatedWords text={t('landing.promo.headlineLine1')} delayStart={0.45} stagger={0.04} />
        <br />
        <AnimatedWords text={t('landing.promo.headlineLine2a')} delayStart={0.65} stagger={0.04} />
        {'\u00A0'}
        <motion.span
          className="relative mx-1 inline-flex -translate-y-[0.16em] align-middle"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.85 }}
        >
          <span className="inline-flex h-[0.92em] w-[0.92em] min-h-8 min-w-8 items-center justify-center rounded-sm bg-[#DFFF4F] md:min-h-11 md:min-w-11">
            <Logo size={20} className="h-[0.58em] w-[0.58em] min-h-4 min-w-4 md:min-h-6 md:min-w-6 text-[#1F3818]" />
          </span>
        </motion.span>
        {'\u00A0'}
        <AnimatedWords
          text={t('landing.promo.headlineLine2b')}
          className="text-foreground/25 dark:text-white/25"
          delayStart={0.75}
          stagger={0.04}
        />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.95 }}
        className="mx-auto mt-3 max-w-[400px] text-[10px] leading-[1.35] text-muted-foreground dark:text-white/55 md:mt-5 md:max-w-[560px] md:text-[15px] md:leading-relaxed"
      >
        {t('landing.promo.subheadline')}
      </motion.p>

      <div className="relative z-20 mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-7">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1], delay: 1.05 }}
        >
          <Link href={ctaHref} className={cn(landingCtaOutlineClass, 'px-6 py-2.5 text-[15px] md:px-7 md:py-3')}>
            {t('landing.promo.headerCta')}
          </Link>
        </motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1], delay: 1.12 }}
        >
          <Link
            href={ctaHref}
            className={cn(landingCtaPrimaryClass, 'px-6 py-2.5 text-[15px] md:px-7 md:py-3')}
          >
            {t('landing.promo.primaryCta')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
