'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AccountDropdownContent } from '@/components/account-dropdown';
import { BrandLogo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavBlurBackdrop } from '@/components/nav-blur-backdrop';
import { useLogoutMutation } from '@/modules/auth/hooks/use-auth-query';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const APP_NAV_LEFT = [
  { label: 'Home', href: '/' },
  { label: 'Learn', href: '/learn' },
] as const;

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
          {APP_NAV_LEFT.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm transition-colors',
                isActive(item.href)
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <BrandLogo href="/" iconSize={30} iconRounded="2.5xl" className="md:col-start-2 md:justify-self-center" />

        <div className="flex justify-end md:col-start-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Account menu"
                >
                  <Avatar className="h-9 w-9 border border-border sm:h-10 sm:w-10">
                    <AvatarImage src={user.picture ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <AccountDropdownContent
                user={user}
                initials={initials}
                onLogout={() => logout.mutate()}
              />
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
