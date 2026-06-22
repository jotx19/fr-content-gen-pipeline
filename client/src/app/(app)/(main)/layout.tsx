'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { cn } from '@/lib/utils';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignIn = pathname === '/signin';
  const isLesson = pathname.startsWith('/learn/lesson') || pathname.startsWith('/learn/results');

  const isLanding = pathname === '/';

  return (
    <div className={cn('flex flex-col', isSignIn || isLesson ? 'h-dvh' : 'min-h-dvh')}>
      {!isLesson && !isSignIn && !isLanding && <Navbar />}
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
