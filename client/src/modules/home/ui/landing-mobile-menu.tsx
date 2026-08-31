'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

import { bricolage } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

import { landingCtaPrimaryClass } from './landing-button-styles';

const mobileLinkClass = cn(
  bricolage.className,
  'block w-full py-4 text-left text-[1.75rem] font-semibold tracking-tight',
  'text-white/80 transition-colors hover:text-white',
);

const mobileMenuContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } },
};

const mobileMenuRowVariants = {
  hidden: { opacity: 0, y: -12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function MobileMenuRow({
  withSeparator = true,
  children,
}: {
  withSeparator?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={mobileMenuRowVariants}
      className={cn(withSeparator && 'border-b border-white/10')}
    >
      {children}
    </motion.div>
  );
}

type LandingNavItem = {
  href: string;
  key: 'home' | 'howItWorks' | 'company' | 'caseStudies';
  active?: boolean;
};

export function LandingMobileMenu({
  open,
  onClose,
  nav,
  ctaHref,
}: {
  open: boolean;
  onClose: () => void;
  nav: readonly LandingNavItem[];
  ctaHref: string;
}) {
  const { t } = useI18n();
  const pathname = usePathname();

  const isActive = (href: string, active?: boolean) => {
    if (active) return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.mobile')}
          className={cn(
            'pointer-events-auto fixed inset-0 z-[60] overflow-y-auto lg:hidden',
            'bg-black/80 backdrop-blur-2xl',
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.nav
            aria-label={t('nav.primary')}
            className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 pt-24 pb-[max(2rem,env(safe-area-inset-bottom))]"
            variants={mobileMenuContainerVariants}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col">
              {nav.map(({ href, key, active }) => (
                <MobileMenuRow key={key}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(mobileLinkClass, isActive(href, active) && 'text-white')}
                  >
                    {t(`landing.promo.nav.${key}`)}
                  </Link>
                </MobileMenuRow>
              ))}
            </div>

            <motion.div variants={mobileMenuRowVariants} className="mt-auto pt-8">
              <Link
                href={ctaHref}
                onClick={onClose}
                className={cn(landingCtaPrimaryClass, 'w-full justify-center px-6 py-3.5 text-base')}
              >
                {t('landing.promo.headerCta')}
              </Link>
            </motion.div>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
