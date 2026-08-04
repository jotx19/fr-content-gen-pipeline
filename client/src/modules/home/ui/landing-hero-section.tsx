'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { bricolage } from '@/lib/fonts';
import { useAuthStore } from '@/store/authStore';
import { LandingCraftCards } from './landing-craft-cards';

const ease = [0.22, 1, 0.36, 1] as const;
const fade = { duration: 0.28, ease };

export function LandingHeroSection() {
  const reduceMotion = useReducedMotion() ?? false;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const href = isAuthenticated ? '/learn' : '/signin';
  const label = isAuthenticated ? 'Explore' : 'Start free';

  return (
    <section
      id="features"
      className={cn(
        'relative z-10 flex flex-col px-2 sm:pb-12',
        'h-[calc(100dvh-10rem)] justify-center overflow-hidden pb-4',
        'sm:h-auto sm:min-h-[calc(100dvh-3.5rem)] sm:justify-start sm:overflow-visible',
      )}
      aria-label="Fringo home"
    >
      <div className="relative z-10 mx-auto pt-0 sm:pt-10 flex w-full max-w-3xl shrink-0 flex-col items-center justify-center text-center">
        <motion.h1
          className={cn(
            bricolage.className,
            'max-w-[20ch] text-[2.15rem] leading-[1.1] font-semibold tracking-[-0.035em] text-black dark:text-white sm:max-w-4xl sm:text-[3.25rem] sm:leading-[1.05] lg:text-[3.5rem]',
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade}
        >
          Learn French with Clarity and Fringo
        </motion.h1>

        <motion.p
          className=" w-4/5 max-w-md mt-2 text-[8px] leading-[1.7] text-black/70 dark:text-white/70 sm:text-xs md:text-xs"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade}
        >
          Adaptive placement, daily practice, and full progress reports. Start free and learn at your own pace.
        </motion.p>

        <motion.div
          className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade}
        >
          <Link
            href={href}
            className={cn(
              'inline-flex h-8 items-center rounded-full bg-black px-4 text-[12px] font-medium text-white',
              'transition-opacity hover:opacity-80 active:opacity-70',
              'dark:bg-white dark:text-black',
            )}
          >
            {label}
          </Link>
          <Link
            href="#pricing"
            className={cn(
              'inline-flex h-8 items-center rounded-full bg-black/5 px-4 text-[12px] font-medium text-black',
              'transition-opacity hover:opacity-80 active:opacity-70',
              'dark:bg-white/10 dark:text-white',
            )}
          >
            See pricing
          </Link>
        </motion.div>
      </div>

      <div className="relative z-20 flex w-full shrink-0 items-center justify-center sm:flex-1">
        <LandingCraftCards eager />
      </div>
    </section>
  );
}
