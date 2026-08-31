'use client';

import { interTight } from '@/lib/fonts';
import { cn } from '@/lib/utils';

import { LandingHeader } from './landing-header';
import { LandingHeroSection } from './landing-hero-section';
import { LandingShowcaseSection } from './landing-showcase-section';

export function LandingPage() {
  return (
    <div data-landing-page className={cn(interTight.className, 'bg-background text-foreground antialiased')}>
      {/* Hero — natural height on mobile, full viewport on md+ */}
      <div className="flex flex-col overflow-hidden md:min-h-dvh">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col px-5 md:flex-1 md:px-8 lg:px-10">
          <LandingHeader />
          <LandingHeroSection />
        </div>
      </div>

      {/* Mesh — tight below hero on mobile, overlaps viewport on md+ */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] mt-0 px-5 pb-12 sm:pb-16 md:-mt-[26vh] md:px-8 md:pb-24 lg:-mt-[28vh] lg:px-10">
        <LandingShowcaseSection />
      </div>
    </div>
  );
}
