'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { LogOut, Menu, Moon, Sun, X } from '@/components/icons';
import { BrandLogo } from '@/components/logo';
import { APP_NAV_ITEMS, isAppNavActive } from '@/components/nav-items';
import { NavBlurBackdrop } from '@/components/nav-blur-backdrop';
import { useThemeToggle } from '@/components/theme-toggle';
import { useLogoutMutation } from '@/modules/auth/hooks/use-auth-query';
import { bricolage } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

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

function AppMobileMenu({
  open,
  onClose,
  onLogout,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  pathname: string;
}) {
  const { isDark, toggle, mounted } = useThemeToggle();
  const { t } = useI18n();

  const mobileItems: { label: string; href: string; exact?: boolean }[] = [
    ...APP_NAV_ITEMS.map((item) => ({
      label: t(`common.${item.navKey}`),
      href: item.href,
      exact: item.exact,
    })),
    { label: t('common.settings'), href: '/settings' },
  ];

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
            aria-label={t('nav.mobile')}
            className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 pt-24 pb-12"
            variants={mobileMenuContainerVariants}
            initial="hidden"
            animate="show"
          >
            {mobileItems.map((item) => {
              const active =
                item.href === '/settings'
                  ? pathname.startsWith('/settings')
                  : isAppNavActive(pathname, item);
              return (
                <MobileMenuRow key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(mobileLinkClass, active && 'text-white')}
                  >
                    {item.label}
                  </Link>
                </MobileMenuRow>
              );
            })}

            <MobileMenuRow>
              <button
                type="button"
                onClick={toggle}
                className={cn(mobileLinkClass, 'flex w-full items-center justify-between')}
              >
                <span className="inline-flex items-center gap-3">
                  {t('common.appearance')}
                </span>
                {mounted ? (
                  isDark ? (
                    <Sun className="size-5 shrink-0 opacity-60" strokeWidth={2} />
                  ) : (
                    <Moon className="size-5 shrink-0 opacity-60" strokeWidth={2} />
                  )
                ) : null}
              </button>
            </MobileMenuRow>

            <MobileMenuRow withSeparator={false}>
              <button
                type="button"
                className={cn(
                  mobileLinkClass,
                  'flex items-center gap-3 text-red-500 hover:text-red-400',
                )}
                onClick={() => {
                  onClose();
                  onLogout();
                }}
              >
                <LogOut className="size-6 shrink-0" strokeWidth={2} />
                {t('common.logOut')}
              </button>
            </MobileMenuRow>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Mobile top bar — hamburger + logo, landing-style overlay menu */
export function AppMobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 md:hidden">
      <NavBlurBackdrop />

      <header className="pointer-events-auto relative z-50 flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            {menuOpen ? (
              <X className="size-5" strokeWidth={2.25} />
            ) : (
              <Menu className="size-5" strokeWidth={2.25} />
            )}
          </button>

          <BrandLogo href="/" iconSize={30} showText={false} />
        </div>

        {user ? (
          <span
            className={cn(
              bricolage.className,
              'truncate text-sm font-medium text-foreground/80 dark:text-white/80',
            )}
          >
            {user.name?.split(' ')[0]}
          </span>
        ) : null}
      </header>

      <AppMobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={() => logout.mutate()}
        pathname={pathname}
      />
    </div>
  );
}

export function AppMobileNavSpacer() {
  return <div className="h-20 shrink-0 md:hidden" aria-hidden />;
}
