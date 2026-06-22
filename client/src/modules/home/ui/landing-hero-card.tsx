'use client';

import { BookOpen, Download, Pause, Volume2 } from 'lucide-react';

export function LandingHeroCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/35 bg-white/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-5">
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <BookOpen className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="text-sm font-medium">Daily practice</span>
        </div>
        <span className="text-xs text-white/80">09:17</span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
        <button
          type="button"
          aria-label="Play lesson"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-neutral-900"
        >
          <Pause className="h-3.5 w-3.5" fill="currentColor" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="h-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-[35%] rounded-full bg-white/90" />
          </div>
          <p className="mt-1.5 text-[11px] text-white/75">0:00 / 8:00</p>
        </div>
        <Volume2 className="h-4 w-4 shrink-0 text-white/80" />
        <Download className="h-4 w-4 shrink-0 text-white/80" />
      </div>
    </div>
  );
}
