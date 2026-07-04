'use client';

import Link from 'next/link';
import {
  BookOpen,
  LogOut,
  Moon,
  Palette,
  PenLine,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useThemeToggle } from '@/components/theme-toggle';
import type { AuthUser } from '@/modules/auth/types/auth';
import { cn } from '@/lib/utils';

const panelClass = cn(
  'w-52 rounded-2xl border p-1 shadow-sm',
  'border-zinc-200/80 bg-white text-zinc-800',
  'dark:border-white/5 dark:bg-[#171717] dark:text-neutral-100 dark:shadow-none'
);

const itemClass = cn(
  'cursor-pointer gap-2 !rounded-md px-1.5 py-1 text-sm transition-colors',
  'hover:bg-zinc-100 dark:hover:bg-white/5',
  'focus:bg-zinc-100 dark:focus:bg-white/5',
  'data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-white/5'
);

const iconBoxClass = cn(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
  'bg-zinc-100 dark:bg-[#262626]'
);
const iconClass = 'h-[18px] w-[18px] text-zinc-600 dark:text-white';
const trailingIconClass = 'h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-neutral-400';
const destructiveItemClass = cn(
  itemClass,
  'text-red-600 dark:text-red-400',
  'hover:bg-red-50 dark:hover:bg-red-500/10',
  'focus:bg-red-50 dark:focus:bg-red-500/10',
  'data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-500/10'
);

const destructiveIconBoxClass = cn(iconBoxClass, 'bg-red-50 dark:bg-red-500/10');
const destructiveIconClass = 'h-[18px] w-[18px] text-red-600 dark:text-red-400';

const iconStroke = 2;

type AccountDropdownContentProps = {
  user: AuthUser;
  initials: string;
  onLogout: () => void;
};

function MenuRow({
  icon: Icon,
  title,
  trailing,
  destructive = false,
}: {
  icon: LucideIcon;
  title: string;
  trailing?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <>
      <div className={destructive ? destructiveIconBoxClass : iconBoxClass}>
        <Icon
          className={destructive ? destructiveIconClass : iconClass}
          strokeWidth={iconStroke}
        />
      </div>
      <span
        className={cn(
          'min-w-0 flex-1 font-medium',
          destructive ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'
        )}
      >
        {title}
      </span>
      {trailing ? <span className="ml-auto shrink-0">{trailing}</span> : null}
    </>
  );
}

export function AccountDropdownContent({ user, initials, onLogout }: AccountDropdownContentProps) {
  const { isDark, toggle, mounted } = useThemeToggle();
  const firstName = user.name.split(' ')[0] ?? user.name;

  return (
    <DropdownMenuContent align="end" sideOffset={8} className={panelClass}>
      <div className="flex items-center gap-2 px-1.5 py-1">
        <div className={iconBoxClass}>
          <Avatar className="h-[18px] w-[18px]">
            <AvatarImage src={user.picture ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-violet-600 text-[9px] font-medium text-white">
              {initials.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-neutral-100">{firstName}</p>
          {user.email && (
            <p className="truncate text-xs text-zinc-500 dark:text-neutral-500">{user.email}</p>
          )}
        </div>
      </div>

      <DropdownMenuSeparator className="my-0.5 bg-zinc-200 dark:bg-white/6" />

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn">
          <MenuRow icon={BookOpen} title="Learn" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn/writing">
          <MenuRow icon={PenLine} title="Writing" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={toggle} className={itemClass}>
        <MenuRow
          icon={Palette}
          title="Appearance"
          trailing={
            mounted ? (
              isDark ? (
                <Sun className={trailingIconClass} strokeWidth={iconStroke} />
              ) : (
                <Moon className={trailingIconClass} strokeWidth={iconStroke} />
              )
            ) : null
          }
        />
      </DropdownMenuItem>

      <DropdownMenuItem onClick={onLogout} className={cn(destructiveItemClass, 'flex w-full items-center gap-2')}>
        <MenuRow icon={LogOut} title="Log out" destructive />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
