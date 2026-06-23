'use client';

import Link from 'next/link';
import {
  BookOpen,
  ChevronRight,
  Home,
  LogOut,
  Moon,
  Palette,
  PenLine,
  Sun,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useThemeToggle } from '@/components/theme-toggle';
import { BRAND } from '@/lib/brand';
import type { AuthUser } from '@/modules/auth/types/auth';
import { cn } from '@/lib/utils';

const itemClass = cn(
  'cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/85',
  'focus:bg-white/[0.08] focus:text-white data-[highlighted]:bg-white/[0.08] data-[highlighted]:text-white'
);

const menuIconClass = 'h-4 w-4 shrink-0 text-white/85';
const menuIconMutedClass = 'h-3.5 w-3.5 shrink-0 text-white/45';
const iconStroke = 1.25;

type AccountDropdownContentProps = {
  user: AuthUser;
  initials: string;
  onLogout: () => void;
};

export function AccountDropdownContent({ user, initials, onLogout }: AccountDropdownContentProps) {
  const { isDark, toggle, mounted } = useThemeToggle();
  const firstName = user.name.split(' ')[0] ?? user.name;

  return (
    <DropdownMenuContent
      align="end"
      sideOffset={8}
      className="w-[15rem] rounded-2xl border border-white/10 bg-[#262626] p-1 text-white shadow-xl"
    >
      <div className="mx-1 mt-1 flex items-center gap-2.5 rounded-xl border border-white/12 px-2.5 py-2">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user.picture ?? undefined} alt={user.name} />
          <AvatarFallback className="bg-violet-600 text-xs font-semibold text-white">
            {initials.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{firstName}</p>
          {user.email && (
            <p className="truncate text-[11px] leading-tight text-white/45">{user.email}</p>
          )}
        </div>
      </div>

      <DropdownMenuSeparator className="my-1 bg-white/[0.08]" />

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/">
          <Home className={menuIconClass} strokeWidth={iconStroke} />
          <span className="flex-1">Home</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn">
          <BookOpen className={menuIconClass} strokeWidth={iconStroke} />
          <span className="flex-1">Learn</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn/writing">
          <PenLine className={menuIconClass} strokeWidth={iconStroke} />
          <span className="flex-1">Writing</span>
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1 bg-white/[0.08]" />

      <DropdownMenuItem onClick={toggle} className={itemClass}>
        <Palette className={menuIconClass} strokeWidth={iconStroke} />
        <span className="flex-1">Appearance</span>
        {mounted ? (
          isDark ? (
            <Sun className={menuIconMutedClass} strokeWidth={iconStroke} />
          ) : (
            <Moon className={menuIconMutedClass} strokeWidth={iconStroke} />
          )
        ) : null}
        <ChevronRight className={menuIconMutedClass} strokeWidth={iconStroke} />
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1 bg-white/[0.08]" />

      <DropdownMenuItem onClick={onLogout} className={itemClass}>
        <LogOut className={menuIconClass} strokeWidth={iconStroke} />
        <span className="flex-1">Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
