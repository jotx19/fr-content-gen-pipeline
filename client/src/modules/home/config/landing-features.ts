import type { AppIcon } from '@/components/icons';
import { BarChart3, BookOpen, Target } from '@/components/icons';

export const LANDING_FEATURES = [
  {
    title: 'Adaptive placement',
    description: 'Get your CEFR level in minutes with a smart placement test.',
    icon: Target,
  },
  {
    title: 'Daily practice',
    description: 'Short lessons targeting your weak areas quiz style, powered by Fringo.',
    icon: BookOpen,
  },
  {
    title: 'Full progress report',
    description: 'Skill breakdown, level tracking, and saved evaluation history.',
    icon: BarChart3,
  },
] as const satisfies ReadonlyArray<{
  title: string;
  description: string;
  icon: AppIcon;
}>;
