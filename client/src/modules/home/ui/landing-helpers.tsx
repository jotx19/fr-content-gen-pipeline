'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export function FeaturesBridge({
  ctaHref,
  ctaLabel = 'Start free',
}: {
  ctaHref: string;
  ctaLabel?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mb-12 flex flex-col items-center gap-6 pt-6 text-center sm:mb-16 sm:pt-10 md:mb-20">
      <motion.h2
        className={cn(
          bricolage.className,
          'max-w-3xl text-[1.65rem] leading-[1.15] font-semibold tracking-tight text-black dark:text-white sm:text-[2.5rem] sm:leading-[1.12] lg:text-[3rem]',
        )}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        Everything you need to improve.
        <br className="hidden sm:block" />
        Placement, practice, and progress.
      </motion.h2>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={ctaHref}
          className="inline-flex h-11 items-center rounded-full bg-black px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
        >
          {ctaLabel}
        </Link>
      </motion.div>
    </div>
  );
}
