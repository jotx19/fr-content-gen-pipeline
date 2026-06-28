'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { cn } from '@/lib/utils';

type SuccessLottieProps = {
  className?: string;
};

export function SuccessLottie({ className }: SuccessLottieProps) {
  return (
    <DotLottieReact
      src="/learn/Success.lottie"
      loop={false}
      autoplay
      className={cn('h-full w-full', className)}
    />
  );
}
