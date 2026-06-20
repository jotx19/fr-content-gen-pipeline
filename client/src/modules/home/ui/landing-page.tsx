'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LANDING_FEATURES } from '@/modules/home/config/landing-features';
import { useAuthStore } from '@/store/authStore';

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-[0_6px_0_0_hsl(var(--primary-shadow))]">
          <GraduationCap className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Master French for <span className="text-primary">TEF Canada</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Adaptive placement, Duolingo-style daily lessons, and full evaluation reports —
          powered by AI.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={isAuthenticated ? '/learn' : '/signin'}>
              {isAuthenticated ? 'Continue learning' : 'Get started'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/learn">Explore lessons</Link>
          </Button>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-3">
        {LANDING_FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <Card className="h-full border-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-extrabold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
