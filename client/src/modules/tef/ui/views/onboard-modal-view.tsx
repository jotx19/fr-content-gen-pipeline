'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from '@/components/icons';
import { LogoIcon } from '@/components/logo';
import { LevelPickerWidget } from '@/components/ui/level-picker-widget';
import { OnboardingChecklist } from '@/components/ui/onboarding-checklist';
import { Separator } from '@/components/ui/separator';
import { BRAND } from '@/lib/brand';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useSelfSelectLevelMutation } from '@/modules/tef/hooks/use-tef-queries';
import { toast } from 'sonner';

/** Matches bento “Evaluate level” — rounded-sm, static border, bg-only hover */
const ONBOARD_BTN =
  'group inline-flex h-10 items-center justify-center rounded-sm border border-black/25 bg-black/10 px-4 text-sm font-medium text-black/90 transition-colors hover:bg-black/15 disabled:opacity-50 dark:border-white/25 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15';

const ONBOARD_BTN_INNER =
  'inline-flex items-center justify-center gap-2 transition-transform group-active:scale-[0.95]';

function OnboardButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(ONBOARD_BTN, className)} {...props}>
      <span className={ONBOARD_BTN_INNER}>{children}</span>
    </button>
  );
}

const LEVEL_OPTIONS = [
  { value: 'A1', label: 'Beginner', desc: 'Basic words and phrases' },
  { value: 'A2', label: 'Elementary', desc: 'Simple everyday situations' },
  { value: 'B1', label: 'Intermediate', desc: 'Most daily situations' },
  { value: 'B2', label: 'Upper Intermediate', desc: 'Complex topics, fluent' },
  { value: 'C1', label: 'Advanced', desc: 'Flexible and effective use' },
  { value: 'C2', label: 'Mastery', desc: 'Near-native proficiency' },
] as const;

const PLACEMENT_LESSON_URL = '/learn/lesson?mode=placement&fresh=1';

export function OnboardModalView() {
  const router = useRouter();
  const [pickedLevel, setPickedLevel] = useState('B1');
  const [selectingLevel, setSelectingLevel] = useState(false);

  const selfSelect = useSelfSelectLevelMutation();

  const checklistSteps = useMemo(
    () => [
      { id: 1, title: 'Create your account', isCompleted: true },
      { id: 2, title: 'Set your French level', isCompleted: false },
      { id: 3, title: 'Start practicing', isCompleted: false },
    ],
    []
  );

  const handleSelfSelect = async () => {
    setSelectingLevel(true);
    try {
      await selfSelect.mutateAsync(pickedLevel);
      router.push('/learn');
    } catch {
      toast.error('Something went wrong, try again');
    } finally {
      setSelectingLevel(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 backdrop-blur-md dark:bg-black/50 bg-white/50" aria-hidden />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 md:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Onboarding"
      >
        <div
          className={cn(
            bricolage.className,
            'flex h-[85vh] w-full max-w-[780px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white text-black shadow-2xl md:h-[500px] dark:border-white/10 dark:bg-black/75 dark:text-white/80'
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
            <div className="flex shrink-0 flex-col border-b border-black/10 md:w-[220px] md:border-r md:border-b-0 lg:w-[240px] dark:border-white/10">
              <div className="flex shrink-0 items-center gap-2 px-3 pt-3 pb-2">
                <LogoIcon size={32} rounded="md" />
                <span className="text-xl font-semibold tracking-tight text-black/90 dark:text-white/90">
                  {BRAND.name}
                </span>
              </div>
              <div className="mx-2.5 border-b border-black/10 dark:border-white/10" aria-hidden />
              <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-3 pb-3 md:pb-4">
                <OnboardingChecklist
                  steps={checklistSteps}
                  activeStepId={2}
                  sidebar
                />
              </div>
            </div>

            <div className="hidden w-px shrink-0 bg-black/10 md:block dark:bg-white/10" />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 py-6">
                <LevelPickerWidget
                  levels={[...LEVEL_OPTIONS]}
                  value={pickedLevel}
                  onValueChange={setPickedLevel}
                  title="Select your level"
                />

                <OnboardButton
                  className="w-full max-w-sm"
                  disabled={selectingLevel}
                  onClick={handleSelfSelect}
                >
                  {selectingLevel ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    'Continue with this level'
                  )}
                </OnboardButton>

                <Separator className="w-full max-w-sm bg-black/10 dark:bg-white/10" />

                <OnboardButton
                  className="w-full max-w-sm"
                  onClick={() => router.push(PLACEMENT_LESSON_URL)}
                >
                  Evaluate yourself
                </OnboardButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
