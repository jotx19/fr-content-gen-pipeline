'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLogoutMutation } from '@/modules/auth/hooks/use-auth-query';
import { useAuthStore } from '@/store/authStore';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
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

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <Languages className="h-6 w-6 text-primary" />
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink href="/" active={pathname === '/'}>
            Home
          </NavLink>
          {isAuthenticated && (
            <NavLink href="/learn" active={pathname.startsWith('/learn')}>
              Learn
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated && user ? (
            <>
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={user.picture ?? undefined} alt={user.name} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={() => logout.mutate()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-xl px-3 py-2 text-sm font-bold transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      {children}
    </Link>
  );
}
