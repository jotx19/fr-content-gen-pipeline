import type { LucideIcon } from 'lucide-react';
import { inter } from '@/lib/fonts';

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function LandingFeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_4px_24px_rgba(15,23,42,0.07)]">
      <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <h3 className={`${inter.className} text-base font-semibold text-neutral-900`}>{title}</h3>
      <p className="mt-1 flex-1 text-xs leading-normal text-neutral-500">{description}</p>
    </article>
  );
}
