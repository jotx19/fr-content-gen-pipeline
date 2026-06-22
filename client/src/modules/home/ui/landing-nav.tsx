'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { bricolage } from '@/lib/fonts';
import { BRAND } from '@/lib/brand';
import { LANDING_NAV_LEFT } from '@/modules/home/config/landing-content';
import { useAuthStore } from '@/store/authStore';

export function LandingNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 md:h-24">
      <div
        className="absolute inset-0 bg-[#f9f7f2]/20 backdrop-blur-xl"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 0%, rgba(0,0,0,0.35) 82%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 0%, rgba(0,0,0,0.35) 82%, transparent 100%)',
        }}
      />

      <header className="pointer-events-auto relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:grid md:h-[4.5rem] md:grid-cols-[1fr_auto_1fr] md:justify-normal">
        <nav className="hidden items-center gap-6 md:flex">
          {LANDING_NAV_LEFT.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className={`${bricolage.className} text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl md:col-start-2 md:justify-self-center`}
        >
          {BRAND.name}
        </Link>

        <div className="flex justify-end md:col-start-3">
          <Link
            href={isAuthenticated ? '/learn' : '/signin'}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:px-5"
          >
            {isAuthenticated ? 'Continue' : 'Get started'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>
    </div>
  );
}
