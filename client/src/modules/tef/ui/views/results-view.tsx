'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Flame, Star, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTefProfileQuery } from '@/modules/tef/hooks/use-tef-queries';
import { useLessonStore } from '@/store/lessonStore';

export function ResultsView() {
  const router = useRouter();
  const diagnostic = useLessonStore((s) => s.lastDiagnostic);
  const { data: profile } = useTefProfileQuery();

  useEffect(() => {
    if (!diagnostic) router.replace('/learn');
  }, [diagnostic, router]);

  if (!diagnostic) return null;

  const { overallAccuracy, skillBreakdown = [], weakAreas = [], adjustment, newLevel, summary } =
    diagnostic;
  const pct = overallAccuracy != null ? Math.round(overallAccuracy * 100) : null;
  const xpGain = pct != null ? pct + (skillBreakdown.length || 1) * 5 : 0;

  return (
    <div className="lesson-shell px-4 py-6 pb-28">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-background">
          <CardHeader className="items-center pb-2 text-center">
            <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-[0_4px_0_0_hsl(var(--primary-shadow))]">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Lesson complete!</CardTitle>
            {pct != null && <p className="text-4xl font-extrabold text-primary">{pct}%</p>}
          </CardHeader>
          <CardContent className="flex justify-center gap-6 pb-6">
            <Stat icon={Flame} value={profile?.stats?.streakDays ?? 0} label="Day streak" color="text-duo-orange" />
            <Stat icon={Star} value={`+${xpGain}`} label="XP earned" color="text-duo-yellow" />
          </CardContent>
        </Card>

        {summary && (
          <p className="rounded-2xl border-2 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}

        {adjustment && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-2xl border-2 px-4 py-3 font-bold',
              adjustment === 'levelUp' && 'border-primary bg-primary/10 text-primary',
              adjustment === 'levelDown' && 'border-duo-orange bg-duo-orange/10 text-duo-orange',
              adjustment === 'same' && 'border-border bg-muted'
            )}
          >
            {adjustment === 'levelUp' && <ArrowUp className="h-5 w-5" />}
            {adjustment === 'levelUp' && `Level up → ${newLevel}`}
            {adjustment === 'levelDown' && `Level adjusted → ${newLevel}`}
            {adjustment === 'same' && `Level unchanged — ${profile?.level || newLevel}`}
          </div>
        )}

        {skillBreakdown.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-lg font-extrabold">Skills breakdown</h3>
            {skillBreakdown.map((s) => (
              <div key={s.skillTag} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>{s.skillTag}</span>
                  <span className="text-muted-foreground">
                    {s.correct}/{s.total}
                  </span>
                </div>
                <Progress value={Math.round((s.accuracy ?? 0) * 100)} className="h-3" />
              </div>
            ))}
          </section>
        )}

        {weakAreas.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-lg font-extrabold">Focus next</h3>
            <div className="flex flex-wrap gap-2">
              {weakAreas.map((tag) => (
                <Badge key={tag} variant="weak">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => router.push('/learn/lesson?mode=practice')}>
            Continue learning
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => router.push('/learn/lesson?mode=placement&fresh=1')}>
            Retake placement
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Flame;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={cn('flex items-center justify-center gap-1', color)}>
        <Icon className="h-5 w-5" />
        <span className="text-lg font-extrabold">{value}</span>
      </div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
