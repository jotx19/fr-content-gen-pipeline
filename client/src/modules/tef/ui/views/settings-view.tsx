'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { ArrowRight, ChevronDown, Loader2 } from '@/components/icons';
import { Switch, useSettingsPrefs } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { bricolage, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useSelfSelectLevelMutation, useTefProfileQuery } from '@/modules/tef/hooks/use-tef-queries';
import {
  useSelfSelectWritingLevelMutation,
  useWritingProfileQuery,
} from '@/modules/writing/hooks/use-writing-queries';
import { useAuthStore } from '@/store/authStore';

const panel =
  'w-full rounded-[28px] bg-[#FCFCFC] dark:bg-[#1C1C1C] sm:rounded-[32px]';
const ink = 'text-[#675549] dark:text-white';
const inkMuted = 'text-[#675549]/80 dark:text-white/70';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const LEVEL_LABELS: Record<string, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
};

const dropdownPanel = cn(
  inter.className,
  'min-w-[240px] rounded-[14px] border p-1.5 shadow-xl',
  'border-black/10 bg-[#F4F4F4] text-foreground',
  'dark:border-white/12 dark:bg-[#1A1A1A] dark:text-white',
);

const dropdownItem = cn(
  'cursor-pointer rounded-[10px] py-2.5 pl-3 pr-10 text-[14px] font-medium outline-none',
  'focus:bg-black/[0.06] data-[highlighted]:bg-black/[0.06]',
  'dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10',
);

function SettingsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 px-3 pb-10 sm:space-y-4 sm:px-6">
      <Skeleton className={cn(panel, 'h-16')} />
      <Skeleton className={cn(panel, 'h-40')} />
      <Skeleton className={cn(panel, 'h-40')} />
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
  last,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-5 py-4 sm:px-6',
        !last && 'border-b border-[#675549]/12 dark:border-white/10',
      )}
    >
      <div className="min-w-0">
        <p className={cn(inter.className, 'text-[15px] font-medium', ink)}>{label}</p>
        {description ? (
          <p className={cn(inter.className, 'mt-0.5 text-[13px]', inkMuted)}>{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function LevelDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (level: string) => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            inter.className,
            'inline-flex h-9 min-w-[7.5rem] items-center justify-between gap-2 rounded-full',
            'border border-black/10 bg-black/[0.04] px-3.5 text-[13px] font-medium',
            'dark:border-white/12 dark:bg-white/[0.06]',
            ink,
            'transition-opacity hover:opacity-90 disabled:opacity-50',
          )}
        >
          <span>{value || '—'}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className={dropdownPanel}>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {CEFR_LEVELS.map((level) => (
            <DropdownMenuRadioItem key={level} value={level} className={dropdownItem}>
              <span className="flex min-w-0 items-baseline gap-2 overflow-hidden">
                <span className="shrink-0 font-semibold">{level}</span>
                <span className="truncate text-black/50 dark:text-white/45">
                  {LEVEL_LABELS[level]}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            inter.className,
            'inline-flex h-9 min-w-[7.5rem] items-center justify-between gap-2 rounded-full',
            'border border-black/10 bg-black/[0.04] px-3.5 text-[13px] font-medium',
            'dark:border-white/12 dark:bg-white/[0.06]',
            ink,
            'transition-opacity hover:opacity-90',
          )}
        >
          <span>{current}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className={dropdownPanel}>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value} className={dropdownItem}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SettingsView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const { data: profile, isLoading } = useTefProfileQuery(Boolean(user));
  const { data: writingProfile } = useWritingProfileQuery(Boolean(profile?.level));
  const selfSelect = useSelfSelectLevelMutation();
  const selfSelectWriting = useSelfSelectWritingLevelMutation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { prefs, update, mounted } = useSettingsPrefs();
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => setThemeMounted(true), []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user && !isAuthenticated) {
      router.replace('/signin');
    }
  }, [hasHydrated, user, isAuthenticated, router]);

  if (!hasHydrated || !user || isLoading) return <SettingsSkeleton />;

  const readingLevel = profile?.level ?? 'B1';
  const writingLevel =
    writingProfile?.writingLevel ?? writingProfile?.level ?? readingLevel;

  const appearanceValue =
    !themeMounted ? 'system' : theme === 'system' ? 'system' : resolvedTheme === 'dark' ? 'dark' : 'light';

  const handleReadingLevel = async (level: string) => {
    if (level === readingLevel) return;
    try {
      await selfSelect.mutateAsync(level);
      toast.success(`Reading level set to ${level}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update level');
    }
  };

  const handleWritingLevel = async (level: string) => {
    if (level === writingLevel) return;
    try {
      await selfSelectWriting.mutateAsync(level);
      update({ writingLevelPref: level });
      toast.success(`Writing level set to ${level}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update writing level');
    }
  };

  return (
    <div className="min-h-dvh w-full px-3 pb-10 pt-4 sm:p-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:gap-4">
        <div className="flex w-full items-end justify-between gap-4 px-1">
          <div className="min-w-0">
            <h1 className={cn(bricolage.className, 'text-2xl font-semibold tracking-tight sm:text-3xl', ink)}>
              Settings
            </h1>
            <p className={cn(inter.className, 'mt-1 text-sm', inkMuted)}>
              Levels, language, and preferences
            </p>
          </div>
          <Link
            href="/learn"
            className={cn(
              inter.className,
              'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-neutral-900',
            )}
          >
            Back to Learn
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </Link>
        </div>

        <section className={panel}>
          <div className="border-b border-[#675549]/12 px-5 py-3.5 sm:px-6 dark:border-white/10">
            <h2 className={cn(inter.className, 'text-[11px] font-semibold uppercase tracking-[0.14em]', inkMuted)}>
              Levels
            </h2>
          </div>
          <SettingRow
            label="Reading level"
            description={LEVEL_LABELS[readingLevel] ?? 'CEFR practice level'}
          >
            {selfSelect.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-black/40 dark:text-white/40" />
            ) : (
              <LevelDropdown value={readingLevel} onChange={handleReadingLevel} />
            )}
          </SettingRow>
          <SettingRow
            label="Writing level"
            description={LEVEL_LABELS[writingLevel] ?? 'Preferred writing difficulty'}
            last
          >
            {selfSelectWriting.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-black/40 dark:text-white/40" />
            ) : (
              <LevelDropdown value={writingLevel} onChange={handleWritingLevel} />
            )}
          </SettingRow>
        </section>

        <section className={panel}>
          <div className="border-b border-[#675549]/12 px-5 py-3.5 sm:px-6 dark:border-white/10">
            <h2 className={cn(inter.className, 'text-[11px] font-semibold uppercase tracking-[0.14em]', inkMuted)}>
              Appearance & language
            </h2>
          </div>
          <SettingRow label="Theme" description="Light, dark, or match system">
            <SelectDropdown
              value={appearanceValue}
              onChange={setTheme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
            />
          </SettingRow>
          <SettingRow label="App language" description="Interface language" last>
            {mounted ? (
              <SelectDropdown
                value={prefs.language}
                onChange={(v) => update({ language: v as 'en' | 'fr' })}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'Français' },
                ]}
              />
            ) : (
              <div className="h-9 w-[7.5rem] rounded-full bg-black/5 dark:bg-white/5" />
            )}
          </SettingRow>
        </section>

        <section className={panel}>
          <div className="border-b border-[#675549]/12 px-5 py-3.5 sm:px-6 dark:border-white/10">
            <h2 className={cn(inter.className, 'text-[11px] font-semibold uppercase tracking-[0.14em]', inkMuted)}>
              Preferences
            </h2>
          </div>
          <SettingRow label="Sound effects" description="Soft cues on actions">
            <Switch
              checked={prefs.soundEffects}
              onCheckedChange={(v) => update({ soundEffects: v })}
              aria-label="Sound effects"
            />
          </SettingRow>
          <SettingRow label="Celebrations" description="XP and streak celebrations">
            <Switch
              checked={prefs.celebrations}
              onCheckedChange={(v) => update({ celebrations: v })}
              aria-label="Celebrations"
            />
          </SettingRow>
          <SettingRow label="Reduce motion" description="Minimize animations" last>
            <Switch
              checked={prefs.reduceMotion}
              onCheckedChange={(v) => update({ reduceMotion: v })}
              aria-label="Reduce motion"
            />
          </SettingRow>
        </section>

        <p className={cn(inter.className, 'px-1 text-center text-[12px]', inkMuted)}>
          Reading and writing levels sync to your account.
        </p>
      </div>
    </div>
  );
}
