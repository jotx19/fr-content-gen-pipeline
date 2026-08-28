'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTefProfileQuery } from '@/modules/tef/hooks/use-tef-queries';
import { OnboardModalView } from '@/modules/tef/ui/views/onboard-modal-view';

const SKIP_PREFIXES = [
  '/signin',
  '/learn/lesson',
  '/learn/writing',
  '/learn/results',
  '/notes/p/',
] as const;

function shouldSkipOnboarding(pathname: string) {
  return SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}

export function OnboardingGate() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const active =
    hasHydrated && Boolean(user) && !shouldSkipOnboarding(pathname);

  const { data: profile, isLoading, isFetched } = useTefProfileQuery(active);

  if (!active || isLoading || !isFetched) return null;
  if (profile?.level) return null;

  return <OnboardModalView />;
}
