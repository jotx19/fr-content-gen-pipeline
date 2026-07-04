import type { AppIcon } from '@/components/icons';
import { inter } from '@/lib/fonts';

type FeatureCardProps = {
  icon: AppIcon;
  title: string;
  description: string;
};

export function LandingFeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <h3 className={`${inter.className} text-base font-semibold text-foreground`}>{title}</h3>
      <p className="mt-1 flex-1 text-xs leading-normal text-muted-foreground">{description}</p>
    </article>
  );
}
