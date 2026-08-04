import Link from 'next/link';

import { LogoIcon } from '@/components/logo';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';

/** Compact footer — logo far left, vertical Site / Privacy columns on the right. */
export function Footer() {
  return (
    <footer
      className={cn(
        bricolage.className,
        'border-t border-black/10 bg-background text-foreground dark:border-white/10',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <LogoIcon size={28} rounded="xl" />
          <span className="text-xs font-semibold tracking-tight">fringo</span>
        </Link>

        <div className="flex items-start gap-8 md:gap-12">
          <div
            className="hidden h-14 w-px shrink-0 bg-black/15 dark:bg-white/15 sm:block"
            aria-hidden
          />
          <div className="flex gap-10 md:gap-14">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-black dark:text-white">
                Site
              </p>
              <ul className="mt-2.5 space-y-1.5 text-xs text-black/70 dark:text-white/70">
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-black dark:hover:text-white"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="transition-colors hover:text-black dark:hover:text-white"
                  >
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-black dark:text-white">
                Privacy
              </p>
              <ul className="mt-2.5 space-y-1.5 text-xs text-black/70 dark:text-white/70">
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-black dark:hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-black dark:hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
