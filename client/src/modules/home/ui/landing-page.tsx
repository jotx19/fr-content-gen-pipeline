'use client';

import Link from 'next/link';
import { bricolage, interTight } from '@/lib/fonts';
import { FeatureCards, SectionHeader, StatsSection } from '@/modules/home/ui/landing-helpers';
import { LandingHeroCards } from '@/modules/home/ui/landing-hero-cards';
import { LandingNav } from '@/modules/home/ui/landing-nav';
import { useAuthStore } from '@/store/authStore';

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ctaHref = isAuthenticated ? '/learn' : '/signin';

  return (
    <div className="min-h-dvh overflow-x-clip bg-background text-foreground">
      <LandingNav />

      <div className="h-20 md:h-24" aria-hidden />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        {/* hero */}
        <section className="flex flex-col items-center px-2 py-12 text-center sm:py-16 lg:py-20">
          <h1
            className={`${bricolage.className} max-w-4xl text-[2.75rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl`}
          >
            <span className="block">Learn French with clarity &</span>
            <span className="block">confidence.</span>
          </h1>

          <p className="mt-3 max-w-md text-[11px] leading-relaxed text-foreground/70 sm:mt-4 sm:max-w-lg sm:text-xs">
            Adaptive placement, daily practice, and full progress reports everything you need to
            reach your French goals. Start free and learn at your own pace.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6">
            <Link
              href={isAuthenticated ? '/learn' : '/signin'}
              className="inline-flex h-11 items-center rounded-full border border-black/6 bg-white px-6 text-sm font-normal text-foreground transition-opacity hover:opacity-90 dark:border-white/10 dark:bg-white dark:text-black"
            >
              Sign up
            </Link>
            <Link
              href="/learn"
              className="inline-flex h-11 items-center rounded-full border border-black/6 bg-white px-6 text-sm font-normal text-foreground transition-opacity hover:opacity-90 dark:border-white/10 dark:bg-white dark:text-black"
            >
              Learn today
            </Link>
          </div>

          <LandingHeroCards className="mt-6 w-full sm:mt-10" />
        </section>
      </div>

      {/* features — interTight.className required so h2/h3 beat global font-serif */}
      <section id="features" className={`${interTight.className} bg-background px-5`}>
        <div className="mx-auto max-w-6xl">
          <SectionHeader ctaHref={ctaHref} />
          <FeatureCards />
        </div>
      </section>

      <div className={interTight.className}>
        <StatsSection />
      </div>
    </div>
  );
}
