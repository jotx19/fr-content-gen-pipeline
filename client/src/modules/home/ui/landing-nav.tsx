'use client';

import Link from 'next/link';
import { ArrowRight } from '@/components/icons';
import { NavBlurBackdrop } from '@/components/nav-blur-backdrop';
import { BrandLogo } from '@/components/logo';
import { ThemeToggleButton } from '@/components/theme-toggle';
import { LANDING_NAV_LEFT } from '@/modules/home/config/landing-content';
import { useAuthStore } from '@/store/authStore';

export function LandingNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 md:h-24">
      <NavBlurBackdrop />

      <header className="pointer-events-auto relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:grid md:h-[4.5rem] md:grid-cols-[1fr_auto_1fr] md:justify-normal">
        <nav className="hidden items-center gap-6 md:flex">
          {LANDING_NAV_LEFT.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <BrandLogo
          href="/"
          iconSize={30}
          className="md:col-start-2 md:justify-self-center"
        />
 
        <div className="flex items-center justify-end gap-2 md:col-start-3">
          <ThemeToggleButton />
          <Link
            href={isAuthenticated ? '/learn' : '/signin'}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:px-5"
          >
            {isAuthenticated ? 'Continue' : 'Get started'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>
    </div>
  );
}
