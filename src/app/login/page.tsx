'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import {
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithEmail } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Capture URL query errors from OAuth redirects if present
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    if (error) {
      setErrorMsg(
        errorDesc
          ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
          : 'Authentication error occurred. Please try again or sign in with your email and password.'
      );
    }
  }, [searchParams]);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const user = await loginWithEmail(email, password);
      if (user) {
        if (user.role === 'student') {
          router.push('/student/dashboard');
        } else if (user.role === 'business') {
          router.push('/business/dashboard');
        } else if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        setErrorMsg('No registered account found for this email. Please register below to create your account!');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?type=login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const message = err instanceof Error ? err.message : 'Google authentication failed. Please try again.';
      setErrorMsg(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6 sm:space-y-8">
      <div className="text-center space-y-2.5 sm:space-y-3">
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-3xl bg-[#0D3D2B] flex items-center justify-center text-white shadow-lg shadow-[#0D3D2B]/20 p-2 sm:p-2.5">
          <LogoIcon className="w-full h-full text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111C16]">
          Welcome to StudentConnect
        </h1>
        <p className="text-xs text-stone-500 font-medium max-w-xs mx-auto">
          Access your workspaces, projects, or client dashboard.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs space-y-5">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-[#FAF3E8] border border-[#ECDAB8] text-[#8C6420] text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#8C6420] shrink-0 mt-0.5" />
            <div className="break-words flex-1">
              {errorMsg}
              {email && (
                <div className="mt-2">
                  <Link
                    href={`/register?email=${encodeURIComponent(email)}`}
                    className="inline-block px-3 py-1.5 bg-[#0D3D2B] text-white rounded-xl font-bold text-[11px] shadow-xs hover:bg-[#08281A] transition-colors"
                  >
                    Create Account Now →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF7F2] hover:bg-[#EFE9DE] text-[#111C16] font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0D3D2B]" />
              Connecting to Google...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-[#E5DFD5] w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
            Or with email
          </span>
          <div className="border-t border-[#E5DFD5] w-full" />
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleFormLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Email Address or Username
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-800">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-[#0D3D2B] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 pr-10 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center text-xs text-stone-500 pt-2 font-medium space-y-3">
            <div>
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-[#0D3D2B] font-black hover:underline">
                Register Free Now
              </Link>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-center">
              <Link href="/admin/login" className="text-stone-400 hover:text-amber-800 text-[11px] font-semibold transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Staff & Administrator Sign In →
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
