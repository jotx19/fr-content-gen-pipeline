'use client';

import { Footer } from '@/components/footer';

import { LandingHeroSection } from './landing-hero-section';
import { LandingNav } from './landing-nav';
import { LandingSections } from './landing-sections';

export function LandingPage() {
  return (
    <div
      data-landing-page
      className="min-h-dvh bg-background text-foreground antialiased"
    >
      <LandingNav />
      <div className="h-20 shrink-0 md:h-24" aria-hidden />
      <LandingHeroSection />
      <LandingSections />
      <Footer />
    </div>
  );
}
