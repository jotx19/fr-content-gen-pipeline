import { Suspense } from 'react';
import HomePage from './home-page';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="lesson-shell items-center justify-center px-4 py-20">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}
