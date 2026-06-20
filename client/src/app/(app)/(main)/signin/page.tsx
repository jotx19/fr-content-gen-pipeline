import { Suspense } from 'react';
import { SignInView } from '@/modules/auth/ui/views/sign-in-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="lesson-shell items-center justify-center px-4 py-20">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      }
    >
      <SignInView />
    </Suspense>
  );
}
