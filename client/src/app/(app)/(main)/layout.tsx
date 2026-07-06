'use client';

import { usePathname } from 'next/navigation';
import { Navbar, NavbarSpacer } from '@/components/navbar';
import { cn } from '@/lib/utils';
import { OnboardingGate } from '@/modules/tef/ui/components/onboarding-gate';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignIn = pathname === '/signin';
  const isLessonScreen = pathname.startsWith('/learn/lesson');
  const isResultsScreen =
    pathname.startsWith('/learn/results') ||
    pathname.startsWith('/learn/writing/results');
  const isLesson = isLessonScreen || isResultsScreen;

  const isLanding = pathname === '/';

  return (
    <div
      className={cn(
        'flex flex-col',
        isSignIn || isLesson ? 'h-dvh' : 'min-h-dvh',
      )}
    >
      {!isLesson && !isSignIn && !isLanding && (
        <>
          <Navbar />
          {pathname === '/learn' ? (
            <div className="h-20 shrink-0 md:h-6" aria-hidden />
          ) : (
            <NavbarSpacer />
          )}
        </>
      )}
      <main
        className={cn(
          'flex flex-1 flex-col',
          pathname === '/' && 'overflow-y-auto',
          isSignIn && 'h-dvh overflow-hidden',
          isLessonScreen && 'h-dvh overflow-hidden',
          isResultsScreen && 'h-dvh min-h-0 overflow-hidden',
        )}
      >
        {children}
      </main>
      <OnboardingGate />
    </div>
  );
}
