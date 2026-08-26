import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-2 overflow-hidden rounded-2xl border border-transparent px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&>svg]:pointer-events-none [&>svg]:size-3.5 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        /** Pastel blue — dates, schedules */
        blue: 'bg-[#E1F3FF] text-[#008EFF] dark:bg-[#008EFF]/18 dark:text-[#66B8FF]',
        /** Pastel orange — frequency, recurrence */
        orange: 'bg-[#FFEEED] text-[#FF5448] dark:bg-[#FF5448]/18 dark:text-[#FF8A82]',
        /** Pastel green — platform, success */
        green: 'bg-[#EAF9F0] text-[#00C363] dark:bg-[#00C363]/18 dark:text-[#5DD99A]',
        /** Pastel sky — location, links */
        sky: 'bg-[#E0F4FF] text-[#0EA5E9] dark:bg-[#0EA5E9]/18 dark:text-[#7DD3FC]',
        /** Pastel rose — people, participants */
        rose: 'bg-[#FEE8EC] text-[#F43F5E] dark:bg-[#F43F5E]/18 dark:text-[#FDA4AF]',
        /** Pastel purple — time, duration, AI actions */
        purple: 'bg-[#F1EAFF] text-[#7130FF] dark:bg-[#7130FF]/18 dark:text-[#A978FF]',
        /** Fringo lime — primary brand actions */
        lime: 'bg-[#DFFF4F] text-black dark:bg-[#DFFF4F] dark:text-black [a&]:hover:bg-[#D4F244] [button&]:hover:bg-[#D4F244]',

        default:
          'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        skill:
          'border-border/70 bg-muted text-muted-foreground uppercase tracking-wide',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs [&>svg]:size-3.5',
        md: 'px-3.5 py-2 text-sm [&>svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  size = 'sm',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
