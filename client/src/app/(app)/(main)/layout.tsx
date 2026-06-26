'use client';

import { usePathname } from 'next/navigation';
import { Navbar, NavbarSpacer } from '@/components/navbar';
import { cn } from '@/lib/utils';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignIn = pathname === '/signin';
  const isLesson =
    pathname.startsWith('/learn/lesson') ||
    pathname.startsWith('/learn/results') ||
    pathname.startsWith('/learn/writing/results');

  const isLanding = pathname === '/';
  const navOverlaysContent = pathname === '/learn';

  return (
    <div className={cn('flex flex-col', isSignIn || isLesson ? 'h-dvh' : 'min-h-dvh')}>
      {!isLesson && !isSignIn && !isLanding && (
        <>
          <Navbar />
          {!navOverlaysContent && <NavbarSpacer />}
        </>
      )}
      <main
        className={cn(
          'flex flex-1 flex-col',
          pathname === '/' && 'overflow-y-auto',
          isSignIn && 'h-dvh overflow-hidden',
          isLesson && 'h-dvh overflow-hidden'
        )}
      >
        {children}
      </main>
    </div>
  );
}
