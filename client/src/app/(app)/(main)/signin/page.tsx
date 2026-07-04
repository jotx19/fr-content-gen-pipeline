import { Suspense } from 'react';
import { Loader2 } from '@/components/icons';
import { SignInView } from '@/modules/auth/ui/views/sign-in-view';

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignInView />
    </Suspense>
  );
}
