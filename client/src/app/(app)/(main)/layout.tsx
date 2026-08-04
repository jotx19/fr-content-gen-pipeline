'use client';

import { usePathname } from 'next/navigation';
import { AppMobileNav, AppMobileNavSpacer } from '@/components/app-mobile-nav';
import { AppSidebar, AppSidebarOffset } from '@/components/app-sidebar';
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
  const isSitePage =
    pathname === '/contact' ||
    pathname === '/terms' ||
    pathname === '/privacy';

  const showAppChrome = !isLesson && !isSignIn && !isLanding && !isSitePage;

  return (
    <div
      className={cn(
        'flex',
        isSignIn || isLesson ? 'h-dvh' : 'min-h-dvh',
      )}
    >
      {showAppChrome ? (
        <>
          <AppSidebar />
          <AppSidebarOffset />
          <AppMobileNav />
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {showAppChrome ? <AppMobileNavSpacer /> : null}
        {isSitePage ? (
          children
        ) : (
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
        )}
      </div>
      <OnboardingGate />
    </div>
  );
}
