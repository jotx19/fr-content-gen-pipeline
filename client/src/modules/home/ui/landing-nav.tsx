'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState, type ReactNode } from 'react';

import { Menu, X } from '@/components/icons';
import { BrandLogo } from '@/components/logo';
import { LANDING_NAV_ITEMS } from '@/components/nav-items';
import { NavBlurBackdrop } from '@/components/nav-blur-backdrop';
import { useThemeToggle } from '@/components/theme-toggle';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

/** Half-outline / half-hatched circle — contrast theme mark */
function ThemeContrastMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `theme-clip-${uid}`;
  const hatchId = `theme-hatch-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="12" y="3.75" width="8.25" height="16.5" />
        </clipPath>
        <pattern
          id={hatchId}
          width="2.75"
          height="2.75"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(40)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="2.75"
            stroke="currentColor"
            strokeWidth="1.15"
          />
        </pattern>
      </defs>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="12"
        cy="12"
        r="8.25"
        fill={`url(#${hatchId})`}
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}

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

type MobileNavItem = {
  href: string;
  label: string;
  active?: boolean;
};

function LandingMobileMenu({
  open,
  onClose,
  items,
  authHref,
  authLabel,
}: {
  open: boolean;
  onClose: () => void;
  items: MobileNavItem[];
  authHref: string;
  authLabel: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="menu"
          className={cn(
            'pointer-events-auto fixed inset-0 z-40 overflow-y-auto md:hidden',
            'bg-black/80 backdrop-blur-2xl',
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.nav
            aria-label="Mobile"
            className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 pt-24 pb-12"
            variants={mobileMenuContainerVariants}
            initial="hidden"
            animate="show"
          >
            {items.map((item) => (
              <MobileMenuRow key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(mobileLinkClass, item.active && 'text-white')}
                >
                  {item.label}
                </Link>
              </MobileMenuRow>
            ))}

            <MobileMenuRow withSeparator={false}>
              <Link
                href={authHref}
                onClick={onClose}
                className={cn(mobileLinkClass, 'text-white')}
              >
                {authLabel}
              </Link>
            </MobileMenuRow>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function LandingNav() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isDark, toggle, mounted } = useThemeToggle();
  const [menuOpen, setMenuOpen] = useState(false);

  const authHref = isAuthenticated ? '/learn' : '/signin';
  const authLabel = isAuthenticated ? 'Continue' : 'Sign in';

  const mobileItems: MobileNavItem[] = [
    ...LANDING_NAV_ITEMS.map((item) => ({
      href: item.href,
      label: item.label,
      active: pathname.startsWith(item.href),
    })),
    { href: '/contact', label: 'Contact' },
    { href: '/#features', label: 'Features' },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 md:h-24">
      <NavBlurBackdrop />

      <header className="pointer-events-auto relative z-50 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:grid md:h-[4.5rem] md:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-black/5 md:hidden dark:hover:bg-white/10"
          >
            {menuOpen ? (
              <X className="size-5" strokeWidth={2.25} />
            ) : (
              <Menu className="size-5" strokeWidth={2.25} />
            )}
          </button>

          <BrandLogo
            href="/"
            iconSize={30}
            showText={false}
            className="md:hidden"
          />

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {LANDING_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-foreground/70 transition-colors hover:text-foreground/90 dark:text-white/70 dark:hover:text-white/90"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <BrandLogo
          href="/"
          iconSize={30}
          className="hidden justify-self-center md:inline-flex"
        />

        <div className="flex items-center justify-end md:col-start-3">
          <div
            className={cn(
              'inline-flex h-9 items-stretch overflow-hidden rounded-full border',
              'border-black/12 bg-[#EDEDED] text-foreground',
              'dark:border-white/15 dark:bg-[#1A1A1A] dark:text-white',
            )}
          >
            <button
              type="button"
              onClick={toggle}
              aria-label={
                !mounted
                  ? 'Toggle theme'
                  : isDark
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
              }
              className={cn(
                'flex w-10 shrink-0 items-center justify-center transition-colors',
                'bg-[#F2F2F2] hover:bg-[#E8E8E8]',
                'dark:bg-[#0D0D0D] dark:hover:bg-[#333]',
              )}
            >
              <ThemeContrastMark className="size-[18px] text-foreground dark:text-white" />
            </button>

            <span
              className="w-px shrink-0 self-stretch bg-black/15 dark:bg-white/20"
              aria-hidden
            />

            <Link
              href={authHref}
              className={cn(
                'inline-flex items-center px-4 text-[13px] font-medium transition-colors',
                'bg-[#E4E4E4] hover:bg-[#DADADA]',
                'dark:bg-background dark:hover:bg-[#333]',
              )}
            >
              {authLabel}
            </Link>
          </div>
        </div>
      </header>

      <LandingMobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={mobileItems}
        authHref={authHref}
        authLabel={authLabel}
      />
    </div>
  );
}
