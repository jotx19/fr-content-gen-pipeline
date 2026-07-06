'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTefProfileQuery } from '@/modules/tef/hooks/use-tef-queries';
import { OnboardModalView } from '@/modules/tef/ui/views/onboard-modal-view';

export function OnboardingGate() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onLearn = pathname === '/learn' || pathname.startsWith('/learn/');
  const onLesson =
    pathname.startsWith('/learn/lesson') || pathname.startsWith('/learn/writing');
  const { data: profile, isLoading } = useTefProfileQuery(
    isAuthenticated && onLearn && !onLesson
  );

  if (!isAuthenticated || !onLearn || onLesson || isLoading) return null;
  if (profile?.level) return null;

  return <OnboardModalView />;
}
