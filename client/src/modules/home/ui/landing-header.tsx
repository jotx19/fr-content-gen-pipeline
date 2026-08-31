'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ChevronDown, Menu, X } from '@/components/icons';
import { Logo } from '@/components/logo';
import { useThemeToggle } from '@/components/theme-toggle';
import { BRAND } from '@/lib/brand';
import { interTight } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

import { LocaleFlag } from './landing-locale-flag';
import {
  landingCtaOutlineClass,
  landingIconButtonClass,
  landingSettingsPillButtonClass,
  landingSettingsPillClass,
  landingSettingsPillSeparator,
} from './landing-button-styles';
import { LandingMobileMenu } from './landing-mobile-menu';
import { LandingThemeContrastMark } from './landing-theme-contrast-mark';

const NAV = [
  { href: '/', key: 'home' as const, active: true },
  { href: '/#showcase', key: 'howItWorks' as const },
  { href: '/contact', key: 'company' as const, chevron: true },
  { href: '/#features', key: 'caseStudies' as const },
];

export function LandingHeader() {
  const { t, locale, setLocale } = useI18n();
  const { isDark, toggle, mounted } = useThemeToggle();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ctaHref = isAuthenticated ? '/learn' : '/signin';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <header className={cn(interTight.className, 'relative z-[70] flex shrink-0 items-center justify-between gap-4 pt-4 md:pt-5')}>
      <Link href="/" className="flex items-center gap-[9px]">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Logo size={34} className="text-foreground" />
        </motion.span>
        <span className="flex text-2xl font-semibold leading-[1.12] tracking-tight text-foreground md:text-[26px]">
          {BRAND.name.split('').map((letter, i) => (
            <span key={`${letter}-${i}`} className="inline-block overflow-hidden pb-[0.06em]">
              <motion.span
                className="inline-block"
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: 0.15 + i * 0.05 }}
              >
                {letter}
              </motion.span>
            </span>
          ))}
        </span>
      </Link>

      <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
        {NAV.map(({ href, key, active, chevron }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 + i * 0.06 }}
          >
            <Link
              href={href}
              className={cn(
                'inline-flex items-center gap-1 text-[15px] font-medium transition-colors',
                active
                  ? 'text-foreground underline decoration-foreground decoration-[1.5px] underline-offset-[6px] dark:text-white dark:decoration-white'
                  : 'text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white/90',
              )}
            >
              {t(`landing.promo.nav.${key}`)}
              {chevron ? <ChevronDown className="size-3" strokeWidth={2.5} /> : null}
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
          className={landingSettingsPillClass}
        >
          <button
            type="button"
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            className={landingSettingsPillButtonClass}
            aria-label={t('common.language')}
          >
            <LocaleFlag locale={locale} className="size-6" />
          </button>
          <span className={landingSettingsPillSeparator} aria-hidden />
          <button
            type="button"
            onClick={toggle}
            className={landingSettingsPillButtonClass}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mounted ? (
              <LandingThemeContrastMark className="size-[18px] text-foreground dark:text-white" />
            ) : (
              <span className="size-[18px]" aria-hidden />
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.45 }}
          className="lg:hidden"
        >
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
            className={landingIconButtonClass}
          >
            {menuOpen ? (
              <X className="size-5 text-foreground" strokeWidth={2.25} />
            ) : (
              <Menu className="size-5 text-foreground" strokeWidth={2.25} />
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.45 }}
          className="hidden lg:block"
        >
          <Link href={ctaHref} className={cn(landingCtaOutlineClass, 'px-5 py-2.5 text-sm')}>
            {t('landing.promo.headerCta')}
          </Link>
        </motion.div>
      </div>
      </header>

      <LandingMobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        nav={NAV}
        ctaHref={ctaHref}
      />
    </>
  );
}
