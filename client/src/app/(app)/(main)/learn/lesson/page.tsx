import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { LessonView } from '@/modules/tef/ui/views/lesson-view';

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="lesson-shell items-center justify-center px-4 py-20">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      }
    >
      <LessonView />
    </Suspense>
  );
}
