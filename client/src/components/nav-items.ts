import { BookOpen, Home, type AppIcon } from '@/components/icons';

export type AppNavItem = {
  label: string;
  href: string;
  icon: AppIcon;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Learn', href: '/learn', icon: BookOpen },
];

export const LANDING_NAV_ITEMS = [
  { label: 'Features', href: '#features' },
  { label: 'Learn', href: '/learn' },
  { label: 'Pricing', href: '#pricing' },
] as const;
