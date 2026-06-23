'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { BarChart3, BookOpen, Languages, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/brand';
import { bricolage } from '@/lib/fonts';
import { useGoogleLoginMutation } from '@/modules/auth/hooks/use-auth-query';
import { Separator } from '@/components/ui/separator';

const SIGNIN_ICONS = [Target, BookOpen, BarChart3] as const;

function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-semibold ${className ?? ''}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground sm:h-9 sm:w-9">
        <Languages className="h-4 w-4 text-background sm:h-[18px] sm:w-[18px]" strokeWidth={2.2} />
      </span>
      <span className="text-base sm:text-lg">{BRAND.name}</span>
    </Link>
  );
}

function SignInCard({
  googleWrapRef,
  googleWidth,
  isPending,
  onSuccess,
}: {
  googleWrapRef: React.RefObject<HTMLDivElement | null>;
  googleWidth: number;
  isPending: boolean;
  onSuccess: (response: CredentialResponse) => void;
}) {
  return (
    <div className="flex w-full max-w-[400px] flex-col gap-12 rounded-[20px] bg-background px-7 py-9 shadow-sm sm:px-8 sm:py-10">
      <div className="space-y-5">
        <BrandMark className="justify-center" />

        <div className="text-center">
          <h1
            className={`${bricolage.className} text-xl font-semibold tracking-tight text-foreground sm:text-2xl`}
          >
            Sign in to {BRAND.name}
          </h1>
          <p className={`${bricolage.className} text-[11px] font-normal text-muted-foreground sm:text-xs`}>
            {BRAND.tagline}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div ref={googleWrapRef} className="relative w-full">
          {isPending ? (
            <Button variant="outline" className="h-11 w-full rounded-xl" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </Button>
          ) : (
            <>
              <div
                className="pointer-events-none flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground"
                aria-hidden
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </div>
              <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0">
                <GoogleLogin
                  onSuccess={onSuccess}
                  onError={() => toast.error('Google sign-in cancelled')}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width={googleWidth}
                />
              </div>
            </>
          )}
        </div>

        <Separator className="bg-border" />

        <div className="flex items-center justify-center gap-4">
          {SIGNIN_ICONS.map((Icon, i) => (
            <span
              key={i}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground"
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
          ))}
        </div>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
          <span className="block">By clicking continue, you agree to our</span>
          <span className="block">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </span>
        </p>
      </div>
    </div>
  );
}

export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/learn';
  const login = useGoogleLoginMutation();
  const googleWrapRef = useRef<HTMLDivElement>(null);
  const [googleWidth, setGoogleWidth] = useState(320);

  useEffect(() => {
    const node = googleWrapRef.current;
    if (!node) return;

    const update = () => {
      const w = node.getBoundingClientRect().width;
      setGoogleWidth(Math.max(280, Math.floor(w)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error('Google did not return a credential');
      return;
    }
    try {
      await login.mutateAsync(response.credential);
      toast.success(`Welcome to ${BRAND.name}!`);
      router.replace(next.startsWith('/') ? next : '/learn');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed');
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background p-2">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[20px]">
        <Image
          src="/signIn-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 rounded-[20px] bg-black/25" />

        <div className="relative z-10 flex w-full justify-center px-4 py-6 sm:px-6 sm:py-8">
          <SignInCard
            googleWrapRef={googleWrapRef}
            googleWidth={googleWidth}
            isPending={login.isPending}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
