'use client';

import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Home,
  Languages,
  LayoutGrid,
  Plus,
  Target,
} from 'lucide-react';
import { LANDING_LESSONS, LANDING_STATS } from '@/modules/home/config/landing-content';
import { cn } from '@/lib/utils';

const SIDEBAR = [
  { icon: Home, label: 'Home', active: false },
  { icon: Target, label: 'Placement', active: false },
  { icon: BookOpen, label: 'Practice', active: true },
  { icon: BarChart3, label: 'Results', active: false },
];

export function LandingPreview() {
  return (
    <div className="relative mx-auto mt-12 max-w-5xl sm:mt-16">
      <div className="pointer-events-none absolute -left-6 top-8 hidden text-4xl sm:block">🇫🇷</div>
      <div className="pointer-events-none absolute -right-4 top-24 hidden text-3xl sm:block">✨</div>
      <div className="pointer-events-none absolute -bottom-2 right-8 hidden text-4xl sm:block">📚</div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-white/40">fringo.app — learn</span>
        </div>

        <div className="flex min-h-[340px] sm:min-h-[400px]">
          <aside className="hidden w-44 shrink-0 border-r border-white/5 p-4 sm:block">
            <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-white">
              <Languages className="h-4 w-4" />
              Fringo
            </div>
            <ul className="space-y-1">
              {SIDEBAR.map(({ icon: Icon, label, active }) => (
                <li
                  key={label}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium',
                    active ? 'bg-white/10 text-white' : 'text-white/45'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 p-4 sm:p-6">
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {LANDING_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3"
                >
                  <p className="text-[10px] text-white/40">{stat.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/35">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <LayoutGrid className="h-4 w-4 text-white/50" />
                Active lessons
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-[#ff5722] px-3 py-1 text-[11px] font-semibold text-white"
              >
                <Plus className="h-3 w-3" />
                New lesson
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {LANDING_LESSONS.map((lesson) => (
                <div
                  key={lesson.title}
                  className="overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a]"
                >
                  <div className={cn('h-16 bg-gradient-to-br', lesson.color)} />
                  <div className="p-3">
                    <span className="text-[10px] font-medium text-white/40">{lesson.tag}</span>
                    <p className="mt-1 text-xs font-semibold text-white">{lesson.title}</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#ff5722]"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-6 left-1/2 hidden -translate-x-1/2 sm:block">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
          Preview
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
