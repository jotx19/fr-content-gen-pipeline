'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';

import { BarChart3, BookOpen, Loader2, Target } from '@/components/icons';
import { BrandLogo } from '@/components/logo';
import { BRAND } from '@/lib/brand';
import { bricolage, inter } from '@/lib/fonts';
import { useGoogleLoginMutation } from '@/modules/auth/hooks/use-auth-query';
import { cn } from '@/lib/utils';

const SIGNIN_ICONS = [Target, BookOpen, BarChart3] as const;

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
    <div
      className={cn(
        'flex w-full max-w-[460px] flex-col rounded-[28px] px-9 py-11 sm:px-11 sm:py-12',
        'bg-[#1C1C1C] text-white',
      )}
    >
      <h1
        className={cn(
          bricolage.className,
          'text-center text-[1.35rem] font-medium tracking-tight text-white sm:text-[1.5rem]',
        )}
      >
        Welcome back
      </h1>

      <div className="-mx-9 m-8 h-px bg-white/12 sm:-mx-11" aria-hidden />

      <div className="mt-7 flex items-center justify-center gap-3">
        {SIGNIN_ICONS.map((Icon, i) => (
          <span
            key={i}
            className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-white/50"
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
        ))}
      </div>

      <div ref={googleWrapRef} className="group relative mt-9 w-full">
        {isPending ? (
          <button
            type="button"
            disabled
            className={cn(
              inter.className,
              'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full',
              'border border-white/12 bg-transparent text-[13px] font-medium text-white/55',
            )}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </button>
        ) : (
          <>
            <div
              className={cn(
                inter.className,
                'pointer-events-none flex h-12 w-full items-center justify-center gap-2 rounded-full',
                'border border-white/12 bg-transparent text-[13px] font-medium text-white/80',
                'transition-colors group-hover:border-white/20 group-hover:bg-white/[0.03]',
              )}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/65" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-full opacity-0">
              <GoogleLogin
                onSuccess={onSuccess}
                onError={() => toast.error('Google sign-in cancelled')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="pill"
                width={googleWidth}
              />
            </div>
          </>
        )}
      </div>

      <p
        className={cn(
          inter.className,
          'mt-5 text-center text-[11px] leading-relaxed text-white/40',
        )}
      >
        By signing in, you agree to our{' '}
        <Link href="/terms" className="underline underline-offset-2 hover:text-white/65">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-white/65">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/learn';
  const login = useGoogleLoginMutation();
  const googleWrapRef = useRef<HTMLDivElement>(null);
  const [googleWidth, setGoogleWidth] = useState(360);

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
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-[#0D0D0D]">
      <div
        className="relative hidden min-h-0 w-1/2 overflow-hidden lg:flex lg:flex-col"
        style={{
          background:
            'linear-gradient(to bottom, #050B14 0%, #0A1628 35%, #14345A 70%, #1E4A78 100%)',
        }}
      >
        <div className="relative z-10 px-8 pt-8 sm:px-10 sm:pt-10">
          <BrandLogo
            href="/"
            iconSize={30}
            iconRounded="lg"
            textClassName="text-white"
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12 text-center">
          <h2
            className={cn(
              bricolage.className,
              'mt-4 max-w-lg text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.75rem]',
            )}
          >
            Place your level,
            <br />
            practice with clarity.
          </h2>
          <p
            className={cn(
              inter.className,
              'mt-5 max-w-md text-[15px] leading-relaxed text-white/65',
            )}
          >
            Adaptive reading and writing for TEF and TCF. Short sessions that
            actually stick.
          </p>
        </div>

        <div className="relative z-10 pb-10 text-center">
          <p className={cn(inter.className, 'text-[12px] text-white/35')}>
            Built for learners who show up every day
          </p>
        </div>
      </div>

      <div className="relative flex min-h-0 w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <BrandLogo href="/" iconSize={28} iconRounded="lg" textClassName="text-white" />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <SignInCard
            googleWrapRef={googleWrapRef}
            googleWidth={googleWidth}
            isPending={login.isPending}
            onSuccess={handleSuccess}
          />
        </div>

        <div
          className={cn(
            inter.className,
            'flex items-center justify-between gap-4 px-6 pb-6 text-[12px] text-white/40',
          )}
        >
          <Link href="/contact" className="underline underline-offset-2 hover:text-white/65">
            Help Centre
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/terms" className="underline underline-offset-2 hover:text-white/65">
              Terms
            </Link>
            <Link href="/privacy" className="underline underline-offset-2 hover:text-white/65">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
