'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import {
  ChartBarIncreasing,
  ChevronRight,
  Globe,
  Home,
  LogOut,
  Moon,
  Note,
  Notebook,
  Palette,
  PenLine,
  Settings,
  Star,
  Sun,
  type AppIcon,
} from '@/components/icons';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const LANG_KEY = 'fringo-language';

const panelClass = cn(
  inter.className,
  'w-[240px] rounded-[18px] border p-1.5 shadow-xl',
  'border-black/10 bg-[#F4F4F4] text-foreground',
  'dark:border-white/12 dark:bg-[#1A1A1A] dark:text-white dark:shadow-[0_16px_48px_rgba(0,0,0,0.55)]',
);

const itemClass = cn(
  'cursor-pointer gap-3 rounded-[10px] px-2.5 py-2.5 text-[14px] font-medium outline-none',
  'text-foreground/90 dark:text-white/90',
  'focus:bg-black/[0.06] data-[highlighted]:bg-black/[0.06] data-[state=open]:bg-black/[0.06]',
  'dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10 dark:data-[state=open]:bg-white/10',
);

const subPanelClass = cn(
  inter.className,
  'min-w-[160px] rounded-[14px] border p-1.5 shadow-xl',
  'border-black/10 bg-[#F4F4F4] text-foreground',
  'dark:border-white/12 dark:bg-[#1A1A1A] dark:text-white',
);

const iconClass = 'h-[18px] w-[18px] shrink-0 text-foreground/70 dark:text-white/75';
const chevronClass = 'ml-auto h-3.5 w-3.5 shrink-0 text-foreground/40 dark:text-white/40';
const iconStroke = 1.75;

type AccountDropdownContentProps = {
  onLogout: () => void;
  userName?: string | null;
  userPicture?: string | null;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
};

function MenuRow({
  icon: Icon,
  title,
  trailing,
}: {
  icon: AppIcon;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <>
      <Icon className={iconClass} strokeWidth={iconStroke} />
      <span className="min-w-0 flex-1">{title}</span>
      {trailing}
    </>
  );
}

function usePreferredLanguage() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === 'en' || stored === 'fr') setLanguage(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const update = (value: string) => {
    setLanguage(value);
    try {
      localStorage.setItem(LANG_KEY, value);
    } catch {
      /* ignore */
    }
  };

  return { language, setLanguage: update };
}

export function AccountDropdownContent({
  onLogout,
  userName,
  userPicture,
  side = 'right',
  align = 'end',
}: AccountDropdownContentProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage } = usePreferredLanguage();

  useEffect(() => setMounted(true), []);

  const displayName = userName?.split(' ')[0] || 'Account';
  const initials =
    userName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'FR';

  const appearanceValue =
    !mounted ? 'system' : theme === 'system' ? 'system' : resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <DropdownMenuContent
      side={side}
      align={align}
      sideOffset={10}
      className={panelClass}
    >
      <div
        className={cn(
          'mb-1 flex items-center gap-2.5 rounded-[12px] border px-2.5 py-2',
          'border-black/10 bg-white/70 dark:border-white/12 dark:bg-white/[0.04]',
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={userPicture ?? undefined} alt={userName ?? 'Account'} />
          <AvatarFallback className="bg-[#7B61FF] text-[11px] font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground dark:text-white">
          {displayName}
        </span>
        <Star
          className="h-3.5 w-3.5 shrink-0 text-foreground/35 dark:text-white/35"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/dashboard">
          <MenuRow icon={ChartBarIncreasing} title="Dashboard" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn">
          <MenuRow icon={Home} title="Home" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/notes">
          <MenuRow icon={Note} title="Notes" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn/lesson?mode=practice">
          <MenuRow icon={Notebook} title="Reading" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn/writing">
          <MenuRow icon={PenLine} title="Writing" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="mx-1 my-1.5 bg-black/10 dark:bg-white/10" />

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={cn(itemClass, 'flex w-full items-center')}>
          <MenuRow
            icon={Palette}
            title="Appearance"
            trailing={<ChevronRight className={chevronClass} strokeWidth={2} />}
          />
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent sideOffset={8} className={subPanelClass}>
          <DropdownMenuRadioGroup
            value={appearanceValue}
            onValueChange={(value) => setTheme(value)}
          >
            <DropdownMenuRadioItem value="light" className={itemClass}>
              <Sun className={iconClass} strokeWidth={iconStroke} />
              Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className={itemClass}>
              <Moon className={iconClass} strokeWidth={iconStroke} />
              Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" className={itemClass}>
              <Palette className={iconClass} strokeWidth={iconStroke} />
              System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={cn(itemClass, 'flex w-full items-center')}>
          <MenuRow
            icon={Globe}
            title="Language"
            trailing={<ChevronRight className={chevronClass} strokeWidth={2} />}
          />
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent sideOffset={8} className={subPanelClass}>
          <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
            <DropdownMenuRadioItem value="en" className={itemClass}>
              English
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="fr" className={itemClass}>
              Français
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/settings">
          <MenuRow icon={Settings} title="Settings" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="mx-1 my-1.5 bg-black/10 dark:bg-white/10" />

      <DropdownMenuItem
        onClick={onLogout}
        className={cn(itemClass, 'flex w-full items-center text-foreground/90 dark:text-white/90')}
      >
        <MenuRow icon={LogOut} title="Log out" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
