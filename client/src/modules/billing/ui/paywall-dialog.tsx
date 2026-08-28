'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from '@/components/icons';
import { LogoIcon } from '@/components/logo';
import { BRAND } from '@/lib/brand';
import { bricolage, inter } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { SubscriptionPlanCards } from '@/modules/billing/ui/subscription-plan-cards';
import { usePaywallStore } from '@/store/paywallStore';

export function PaywallDialog() {
  const { t } = useI18n();
  const open = usePaywallStore((s) => s.open);
  const closePaywall = usePaywallStore((s) => s.closePaywall);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="paywall-backdrop"
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={closePaywall}
          />
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={t('paywall.aria')}
          >
            <motion.div
              key="paywall-panel"
              className={cn(
                'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:h-[90vh] sm:max-h-[90vh] sm:max-w-5xl sm:rounded-[2rem]',
              )}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closePaywall}
                className={`${inter.className} absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black/70 sm:right-4 sm:top-4`}
                aria-label={t('paywall.close')}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex shrink-0 flex-col items-center px-5 pb-2 pt-7 text-center sm:px-8 sm:pb-3 sm:pt-9">
                <div className="inline-flex items-center gap-2.5">
                  <LogoIcon size={28} rounded="lg" />
                  <span className={`${bricolage.className} text-base font-semibold tracking-tight text-[#1A3D2E] sm:text-lg`}>
                    {BRAND.name}
                  </span>
                </div>
                <h2 className={`${bricolage.className} mt-2.5 text-xl font-semibold tracking-tight text-[#1A3D2E] sm:mt-3 sm:text-2xl sm:text-[1.65rem]`}>
                  {t('paywall.headlineDialog')}
                </h2>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 sm:px-6 sm:pb-6">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-[#DFFF4F] p-3 sm:rounded-[2rem] sm:p-5">
                  <SubscriptionPlanCards variant="dialog" onSkip={closePaywall} className="min-h-0 flex-1" />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
