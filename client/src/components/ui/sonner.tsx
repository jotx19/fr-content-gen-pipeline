'use client';

import { Toaster as Sonner } from 'sonner';

export function CustomToaster() {
  return (
    <Sonner
      theme="light"
      richColors
      closeButton
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl border-2 font-semibold',
        },
      }}
    />
  );
}
