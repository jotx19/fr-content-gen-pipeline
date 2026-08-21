'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import {
  ArrowRight,
  ArrowUpDown,
  LogOut,
  Moon,
  Palette,
  Sun,
} from '@/components/icons';
import { AccountDropdownContent } from '@/components/account-dropdown';
import { APP_NAV_ITEMS } from '@/components/nav-items';
import { BrandLogo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavBlurBackdrop } from '@/components/nav-blur-backdrop';
import { useThemeToggle } from '@/components/theme-toggle';
import { useLogoutMutation } from '@/modules/auth/hooks/use-auth-query';
import { bricolage } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const APP_NAV_LEFT = APP_NAV_ITEMS;

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

function AccountMobileMenu({
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

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

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
            aria-label="Account"
            className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 pt-24 pb-12"
            variants={mobileMenuContainerVariants}
            initial="hidden"
            animate="show"
          >
            <MobileMenuRow>
              <Link
                href="/profile"
                onClick={onClose}
                className={cn(mobileLinkClass, isActive('/profile') && 'text-white')}
              >
                Profile
              </Link>
            </MobileMenuRow>
            <MobileMenuRow>
              <Link
                href="/learn"
                onClick={onClose}
                className={cn(
                  mobileLinkClass,
                  isActive('/learn') && !pathname.startsWith('/learn/writing') && 'text-white',
                )}
              >
                Home
              </Link>
            </MobileMenuRow>
            <MobileMenuRow>
              <Link
                href="/learn/writing"
                onClick={onClose}
                className={cn(
                  mobileLinkClass,
                  pathname.startsWith('/learn/writing') && 'text-white',
                )}
              >
                Writing
              </Link>
            </MobileMenuRow>
            <MobileMenuRow>
              <button
                type="button"
                onClick={toggle}
                className={cn(mobileLinkClass, 'flex w-full items-center justify-between')}
              >
                <span className="inline-flex items-center gap-3">
                  <Palette className="size-6 shrink-0 opacity-70" strokeWidth={2} />
                  Appearance
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
                Log out
              </button>
            </MobileMenuRow>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const avatarPillClass = cn(
  'inline-flex h-9 items-center gap-1.5 rounded-full border pl-0.5 pr-2.5 outline-none',
  'border-black/12 bg-[#EDEDED] text-foreground',
  'dark:border-white/15 dark:bg-[#1A1A1A] dark:text-white',
  'transition-opacity hover:opacity-90',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);

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

  if (pathname === '/signin') return null;

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'FR';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const avatar = (
    <>
      <Avatar className="h-8 w-8 border border-black/10 dark:border-white/15">
        <AvatarImage src={user?.picture ?? undefined} alt={user?.name ?? 'Account'} />
        <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
      </Avatar>
      <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" strokeWidth={2} />
    </>
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 md:h-18">
      <NavBlurBackdrop />

      <header className="pointer-events-auto relative z-50 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:grid md:h-[4.5rem] md:grid-cols-[1fr_auto_1fr] md:justify-normal">
        <nav className="hidden items-center gap-6 md:flex">
          {APP_NAV_LEFT.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 text-sm transition-colors',
                  active
                    ? 'font-medium text-foreground/90 dark:text-white/90'
                    : 'text-foreground/70 hover:text-foreground/90 dark:text-white/70 dark:hover:text-white/90',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    active
                      ? 'text-foreground/90 dark:text-white/90'
                      : 'text-foreground/70 dark:text-white/70',
                  )}
                  strokeWidth={2}
                />
                {t(`common.${item.navKey}`)}
              </Link>
            );
          })}
        </nav>

        <BrandLogo
          href="/"
          iconSize={30}
          iconRounded="md"
          className="md:col-start-2 md:justify-self-center"
          textClassName="hidden md:inline"
        />

        <div className="flex justify-end md:col-start-3">
          {isAuthenticated && user ? (
            <>
              <button
                type="button"
                className={cn(avatarPillClass, 'md:hidden')}
                aria-label="Account menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {avatar}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(avatarPillClass, 'hidden md:inline-flex')}
                    aria-label="Account menu"
                  >
                    {avatar}
                  </button>
                </DropdownMenuTrigger>
                <AccountDropdownContent
                  onLogout={() => logout.mutate()}
                  userName={user.name}
                  userPicture={user.picture}
                  side="bottom"
                  align="end"
                />
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:px-5"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      {isAuthenticated && user ? (
        <AccountMobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onLogout={() => logout.mutate()}
          pathname={pathname}
        />
      ) : null}
    </div>
  );
}

/** Spacer matching fixed navbar height — place below Navbar in layout */
export function NavbarSpacer() {
  return <div className="h-20 shrink-0 md:h-24" aria-hidden />;
}
