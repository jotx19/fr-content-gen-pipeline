'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ArrowUpDown, Check, Copy, Loader2, X } from '@/components/icons';
import { bricolage, inter } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { handlePaywallError, isAtDailyLimit, remainingQuota } from '@/lib/paywall';
import { cn } from '@/lib/utils';
import { useBillingStatusQuery } from '@/modules/billing/hooks/use-billing-queries';
import { useTranslateMutation } from '@/modules/translate/hooks/use-translate-queries';
import { usePaywallStore } from '@/store/paywallStore';

const panel = 'rounded-[28px] bg-[#FCFCFC] dark:bg-[#1C1C1C] sm:rounded-[32px]';
const ink = 'text-[#675549] dark:text-white';
const inkMuted = 'text-[#675549]/80 dark:text-white/70';

type Lang = 'EN' | 'FR';

export function TranslateView() {
  const { t } = useI18n();
  const { data: billing } = useBillingStatusQuery();
  const translate = useTranslateMutation();
  const [sourceLang, setSourceLang] = useState<Lang>('EN');
  const [targetLang, setTargetLang] = useState<Lang>('FR');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const langLabel = (lang: Lang) =>
    lang === 'EN' ? t('common.english') : t('common.french');

  const translateQuota = remainingQuota(billing, 'translate');
  const translateLimitReached = isAtDailyLimit(billing, 'translate');

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const handleConvert = async () => {
    const trimmed = sourceText.trim();
    if (!trimmed) {
      toast.error(t('translate.enterText'));
      return;
    }
    if (translateLimitReached) {
      usePaywallStore.getState().openPaywall('translate');
      return;
    }
    try {
      const result = await translate.mutateAsync({
        text: trimmed,
        sourceLang,
        targetLang,
      });
      setTranslatedText(result.text);
    } catch (err) {
      if (handlePaywallError(err, 'translate')) return;
      toast.error(err instanceof Error ? err.message : t('translate.failed'));
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast.success(t('common.copied'));
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t('translate.copyFailed'));
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
  };

  return (
    <div className="min-h-dvh w-full px-3 pb-10 pt-4 sm:p-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        <div className="px-1">
          <h1 className={cn(bricolage.className, 'text-2xl font-semibold tracking-tight sm:text-3xl', ink)}>
            {t('translate.title')}
          </h1>
          <p className={cn(inter.className, 'mt-1 text-sm', inkMuted)}>
            {t('translate.subtitlePrefix')}{' '}
            <span className="text-[#675549] font-bold dark:text-white">EN</span> to{' '}
            <span className="text-[#675549] font-bold dark:text-white">FR</span>{' '}
            {t('translate.subtitleSuffix')}
            {translateQuota.limit != null ? (
              <span className="ml-1 tabular-nums text-[#675549]/60 dark:text-white/50">
                ({translateQuota.used}/{translateQuota.limit})
              </span>
            ) : null}
          </p>
        </div>

        <section className={cn(panel, 'overflow-hidden')}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#675549]/12 px-5 py-3.5 sm:px-6 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  inter.className,
                  'rounded-full bg-[#675549]/10 px-3 py-1.5 text-xs font-medium dark:bg-white/10',
                  ink,
                )}
              >
                {langLabel(sourceLang)}
              </span>
              <button
                type="button"
                onClick={handleSwap}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-[10px]',
                  inkMuted,
                  'hover:bg-[#675549]/10 hover:text-[#675549] dark:hover:bg-white/10 dark:hover:text-white',
                )}
                aria-label={t('translate.swap')}
                title={t('translate.swap')}
              >
                <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <span
                className={cn(
                  inter.className,
                  'rounded-full bg-[#675549]/10 px-3 py-1.5 text-xs font-medium dark:bg-white/10',
                  ink,
                )}
              >
                {langLabel(targetLang)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={!sourceText && !translatedText}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-[10px]',
                  inkMuted,
                  'hover:bg-[#675549]/10 hover:text-[#675549] disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white',
                )}
                aria-label={t('common.clear')}
                title={t('common.clear')}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={handleConvert}
                disabled={translate.isPending || !sourceText.trim()}
                className={cn(
                  inter.className,
                  'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium',
                  'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900',
                  'transition-opacity hover:opacity-90 disabled:opacity-50',
                )}
              >
                {translate.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {t('translate.convert')}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2">
            <div className="flex min-h-[280px] flex-col border-b border-[#675549]/12 sm:min-h-[400px] lg:border-b-0 lg:border-r dark:border-white/10">
              <div className="flex h-11 shrink-0 items-center justify-between px-5 sm:px-6">
                <h2 className={cn(inter.className, 'text-xs font-semibold uppercase tracking-wide', inkMuted)}>
                  {langLabel(sourceLang)}
                </h2>
                <span
                  className={cn(
                    inter.className,
                    'inline-flex h-8 items-center text-[11px] tabular-nums',
                    inkMuted,
                  )}
                >
                  {sourceText.length}/5000
                </span>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value.slice(0, 5000))}
                placeholder={sourceLang === 'EN' ? t('translate.writeEn') : t('translate.writeFr')}
                className={cn(
                  inter.className,
                  'min-h-0 w-full flex-1 resize-none bg-transparent px-5 pb-4 text-[15px] leading-relaxed outline-none sm:px-6',
                  ink,
                  'placeholder:text-[#675549]/35 dark:placeholder:text-white/30',
                )}
              />
            </div>

            <div className="flex min-h-[280px] flex-col sm:min-h-[400px]">
              <div className="flex h-11 shrink-0 items-center justify-between px-5 sm:px-6">
                <h2 className={cn(inter.className, 'text-xs font-semibold uppercase tracking-wide', inkMuted)}>
                  {langLabel(targetLang)}
                </h2>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!translatedText}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-[10px]',
                    inkMuted,
                    'hover:bg-[#675549]/10 hover:text-[#675549] disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-white',
                  )}
                  aria-label={copied ? t('common.copied') : t('translate.copyTranslation')}
                  title={copied ? t('common.copied') : t('common.copy')}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              <div
                className={cn(
                  inter.className,
                  'min-h-0 flex-1 whitespace-pre-wrap px-5 pb-4 text-[15px] leading-relaxed sm:px-6',
                  translatedText ? ink : inkMuted,
                )}
              >
                {translatedText ||
                  (targetLang === 'FR' ? t('translate.appearsFr') : t('translate.appearsEn'))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
