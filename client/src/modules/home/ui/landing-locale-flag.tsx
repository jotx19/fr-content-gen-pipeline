'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils';

function FrenchFlagIcon({ clipId }: { clipId: string }) {
  return (
    <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="30" cy="30" r="30" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="20" height="60" fill="#002395" />
        <rect x="20" width="20" height="60" fill="#FFFFFF" />
        <rect x="40" width="20" height="60" fill="#ED2939" />
      </g>
    </svg>
  );
}

function UkFlagIcon({ clipId }: { clipId: string }) {
  return (
    <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="30" cy="30" r="30" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="60" fill="#012169" />
        <path d="M0,0 L60,60 M60,0 L0,60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M0,0 L60,60" stroke="#C8102E" strokeWidth="4" />
        <path d="M60,0 L0,60" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 V60 M0,30 H60" stroke="#FFFFFF" strokeWidth="16" />
        <path d="M30,0 V60 M0,30 H60" stroke="#C8102E" strokeWidth="9" />
      </g>
    </svg>
  );
}

export function LocaleFlag({ locale, className }: { locale: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const isFr = locale === 'fr';

  return (
    <span className={cn('flex size-7 shrink-0 overflow-hidden rounded-full', className)} aria-hidden>
      {isFr ? <FrenchFlagIcon clipId={`fr-flag-${uid}`} /> : <UkFlagIcon clipId={`uk-flag-${uid}`} />}
    </span>
  );
}
