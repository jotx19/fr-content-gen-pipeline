'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from '@/components/icons';
import { APP_NAV_ITEMS } from '@/components/nav-items';
import { AccountDropdownContent } from '@/components/account-dropdown';
import { BrandLogo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavBlurBackdrop } from '@/components/nav-blur-backdrop';
import { useLogoutMutation } from '@/modules/auth/hooks/use-auth-query';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const APP_NAV_LEFT = APP_NAV_ITEMS;

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useLogoutMutation();

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

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 md:h-18">
      <NavBlurBackdrop />

      <header className="pointer-events-auto relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:grid md:h-[4.5rem] md:grid-cols-[1fr_auto_1fr] md:justify-normal">
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
                    : 'text-foreground/70 hover:text-foreground/90 dark:text-white/70 dark:hover:text-white/90'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    active
                      ? 'text-foreground/90 dark:text-white/90'
                      : 'text-foreground/70 dark:text-white/70'
                  )}
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <BrandLogo
          href="/"
          iconSize={30}
          iconRounded="md"
          className="md:col-start-2 md:justify-self-center"
        />

        <div className="flex justify-end md:col-start-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Account menu"
                >
                  <Avatar className="h-9 w-9 border border-black/10 dark:border-white/15 sm:h-10 sm:w-10">
                    <AvatarImage src={user.picture ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <AccountDropdownContent onLogout={() => logout.mutate()} />
            </DropdownMenu>
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
    </div>
  );
}

/** Spacer matching fixed navbar height — place below Navbar in layout */
export function NavbarSpacer() {
  return <div className="h-20 shrink-0 md:h-24" aria-hidden />;
}
