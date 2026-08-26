'use client';

import { usePathname } from 'next/navigation';
import { AppMobileNav, AppMobileNavSpacer } from '@/components/app-mobile-nav';
import { AppSidebar, AppSidebarOffset } from '@/components/app-sidebar';
import { cn } from '@/lib/utils';
import { OnboardingGate } from '@/modules/tef/ui/components/onboarding-gate';
import { PaywallDialog } from '@/modules/billing/ui/paywall-dialog';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLessonScreen = pathname.startsWith('/learn/lesson');
  const isResultsScreen =
    pathname.startsWith('/learn/results') ||
    pathname.startsWith('/learn/writing/results');
  const isImmersive = isLessonScreen || isResultsScreen;
  const isPublicNote = pathname.startsWith('/notes/p/');

  const showAppChrome = !isImmersive && !isPublicNote;

  return (
    <div className={cn('flex', isImmersive ? 'h-dvh' : 'min-h-dvh')}>
      {showAppChrome ? (
        <>
          <AppSidebar />
          <AppSidebarOffset />
          <AppMobileNav />
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {showAppChrome ? <AppMobileNavSpacer /> : null}
        <main
          className={cn(
            'flex flex-1 flex-col',
            isLessonScreen && 'h-dvh overflow-hidden',
            isResultsScreen && 'h-dvh min-h-0 overflow-hidden',
          )}
        >
          {children}
        </main>
      </div>
      <OnboardingGate />
      <PaywallDialog />
    </div>
  );
}
