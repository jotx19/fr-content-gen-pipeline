'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Languages } from 'lucide-react';
import { bricolage } from '@/lib/fonts';
import { BRAND } from '@/lib/brand';
import { LANDING_FEATURES } from '@/modules/home/config/landing-features';
import { LandingFeatureCard } from '@/modules/home/ui/landing-feature-card';
import { LandingHeroCard } from '@/modules/home/ui/landing-hero-card';
import { LandingNav } from '@/modules/home/ui/landing-nav';
import { useAuthStore } from '@/store/authStore';

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ctaHref = isAuthenticated ? '/learn' : '/signin';

  return (
    <div className="min-h-dvh bg-[#f9f7f2] text-neutral-900">
      <LandingNav />

      <div className="h-20 md:h-24" aria-hidden />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        {/* headline row */}
        <section className="grid grid-cols-1 items-start gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.1fr)_1px_minmax(0,0.9fr)_auto] lg:gap-10 lg:py-12">
          <h1
            className={`${bricolage.className} max-w-lg text-[2.5rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]`}
          >
            Learn French with clarity & <span className="underline">confidence</span>.
          </h1>

          <div className="hidden w-px self-stretch bg-neutral-300/80 lg:block" aria-hidden />

          <p className="max-w-sm text-sm leading-relaxed text-neutral-600 sm:text-[15px] lg:pt-1">
            Adaptive placement, daily practice, and full progress reports everything you need to
            reach your French goals. Start free and learn at your own pace.
          </p>

          <div className="hidden items-start justify-end lg:flex">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900/5 text-neutral-800">
              <Languages className="h-6 w-6" strokeWidth={1.8} />
            </span>
          </div>
        </section>

        {/* hero image + glass card */}
        <section className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
            <Image
              src="/hero.png"
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="(min-width: 1024px) 1152px, 100vw"
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <LandingHeroCard />
            </div>
          </div>
        </section>

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

        <section id="pricing" className="mt-16 border-t border-neutral-200/60 pt-12 text-center">
          <p className={`${bricolage.className} text-xl font-semibold sm:text-2xl`}>
            Start learning with {BRAND.name}
          </p>
          <p className="mt-2 text-sm text-neutral-500">Free to start. No credit card required.</p>
          <Link
            href={ctaHref}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-neutral-900 px-7 text-sm font-medium text-white hover:opacity-90"
          >
            {isAuthenticated ? 'Continue learning' : 'Get started free'}
          </Link>
        </section>
      </div>
    </div>
  );
}
