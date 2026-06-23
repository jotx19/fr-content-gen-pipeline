export const LANDING_NAV_LEFT = [
  { label: 'Features', href: '#features' },
  { label: 'Learn', href: '/learn' },
  { label: 'Pricing', href: '#pricing' },
] as const;

export const LANDING_STATS = [
  { label: 'Your level', value: 'B1', sub: 'CEFR placement' },
  { label: 'Lessons done', value: '24', sub: 'This month' },
  { label: 'Accuracy', value: '87%', sub: 'Last session' },
  { label: 'Day streak', value: '7', sub: 'Keep going' },
] as const;

export const LANDING_LESSONS = [
  {
    title: 'Subjonctif basics',
    tag: 'Grammar',
    progress: 72,
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Travel vocabulary',
    tag: 'Vocabulary',
    progress: 45,
    color: 'from-sky-500 to-blue-600',
  },
  {
    title: 'Formal letter writing',
    tag: 'Writing',
    progress: 30,
    color: 'from-amber-500 to-orange-600',
  },
] as const;
