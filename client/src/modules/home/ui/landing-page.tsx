'use client';

import Link from 'next/link';
import { bricolage } from '@/lib/fonts';
import { BRAND } from '@/lib/brand';
import { LANDING_FEATURES } from '@/modules/home/config/landing-features';
import { LandingFeatureCard } from '@/modules/home/ui/landing-feature-card';
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

          <p className="mt-3 max-w-md text-[11px] leading-relaxed text-muted-foreground sm:mt-4 sm:max-w-lg sm:text-xs">
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

        {/* hero image — optional visual below copy */}
        {/* <section className="relative mt-4 overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
            <Image
              src="/hero.png"
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="(min-width: 1024px) 1152px, 100vw"
            />
          </div>
        </section> */}

        {/* features */}
        <section id="features" className="mt-20 sm:mt-24">
          <h2 className={`${bricolage.className} mb-8 text-2xl font-semibold sm:text-3xl`}>
            Everything you need to improve
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {LANDING_FEATURES.map((feature) => (
              <LandingFeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        <section id="pricing" className="mt-16 border-t border-border pt-12 text-center">
          <p className={`${bricolage.className} text-xl font-semibold sm:text-2xl`}>
            Start learning with {BRAND.name}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Free to start. No credit card required.</p>
          <Link
            href={ctaHref}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-7 text-sm font-medium text-background hover:opacity-90"
          >
            {isAuthenticated ? 'Continue learning' : 'Get started free'}
          </Link>
        </section>
      </div>
    </div>
  );
}
