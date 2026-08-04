'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AccountDropdownContent } from '@/components/account-dropdown';
import { FilterHorizontal, Notification } from '@/components/icons';
import { Logo } from '@/components/logo';
import { APP_NAV_ITEMS, isAppNavActive } from '@/components/nav-items';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BRAND } from '@/lib/brand';
import { useLogoutMutation } from '@/modules/auth/hooks/use-auth-query';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export const APP_SIDEBAR_WIDTH = 60;

const railBtnClass = cn(
  'inline-flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors',
  'text-foreground/55 hover:bg-black/[0.05] hover:text-foreground/85',
  'dark:text-white/50 dark:hover:bg-white/[0.08] dark:hover:text-white/90',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

const railActiveClass =
  'bg-black/[0.07] text-foreground dark:bg-white/[0.1] dark:text-white';

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'FR';

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 hidden w-[60px] flex-col items-center md:flex',
          'border-r border-black/8 bg-background dark:border-white/8',
        )}
        aria-label="App navigation"
      >
        <div className="flex w-full flex-col items-center pt-4">
          <Link
            href="/"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-[12px]',
              'text-foreground transition-opacity hover:opacity-80 dark:text-white',
            )}
            aria-label={BRAND.name}
          >
            <Logo size={22} />
          </Link>
        </div>

        <nav className="mt-6 flex flex-1 flex-col items-center gap-1.5" aria-label="Primary">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isAppNavActive(pathname, item);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(railBtnClass, active && railActiveClass)}
                  >
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="mb-3 flex flex-col items-center gap-1.5 pb-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={railBtnClass}
                aria-label="Notifications"
              >
                <Notification className="h-[22px] w-[22px]" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Notifications
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                aria-label="Settings"
                className={cn(
                  railBtnClass,
                  pathname.startsWith('/settings') && railActiveClass,
                )}
              >
                <FilterHorizontal className="h-[22px] w-[22px]" strokeWidth={1.75} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Settings
            </TooltipContent>
          </Tooltip>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full',
                    'outline-none transition-opacity hover:opacity-90',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                  aria-label="Account menu"
                >
                  <div className="border border-white/30 p-1 rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user.picture ?? undefined}
                      alt={user.name ?? 'Account'}
                    />
                    <AvatarFallback className="bg-[#7B61FF] text-[11px] font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <AccountDropdownContent
                onLogout={() => logout.mutate()}
                userName={user.name}
                userPicture={user.picture}
                side="right"
                align="end"
              />
            </DropdownMenu>
          ) : null}
        </div>
      </aside>
    </TooltipProvider>
  );
}

/** Left offset matching fixed sidebar width — desktop only */
export function AppSidebarOffset({ className }: { className?: string }) {
  return (
    <div
      className={cn('hidden w-[60px] shrink-0 md:block', className)}
      style={{ width: APP_SIDEBAR_WIDTH }}
      aria-hidden
    />
  );
}
