'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuthStatus() {
      try {
        // Check URL parameters for errors
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));

          const error = urlParams.get('error') || hashParams.get('error');
          const errorDescription =
            urlParams.get('error_description') ||
            hashParams.get('error_description') ||
            urlParams.get('message');

          if (error) {
            if (mounted) {
              setLinkError(
                errorDescription
                  ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
                  : 'This password reset link is invalid or has expired. Please request a new one.'
              );
              setVerifyingSession(false);
            }
            return;
          }

          // Check for recovery access token in hash
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');

          if (accessToken && type === 'recovery') {
            const supabase = createClient();
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });

            if (!sessionError) {
              if (mounted) {
                setHasValidSession(true);
                setVerifyingSession(false);
              }
              return;
            }
          }

          // Check if there is an active Supabase session
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            if (mounted) {
              setHasValidSession(true);
              setVerifyingSession(false);
            }
            return;
          }

          // Supabase Auth listener for password recovery event
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              if (event === 'PASSWORD_RECOVERY' || currentSession) {
                if (mounted) {
                  setHasValidSession(true);
                  setVerifyingSession(false);
                }
              }
            }
          );

          // Allow a brief buffer for Supabase Auth to parse URL fragments
          setTimeout(() => {
            if (mounted && verifyingSession) {
              // If still no session after timeout and no explicit error, permit form entry
              setHasValidSession(true);
              setVerifyingSession(false);
            }
          }, 1500);

          return () => {
            authListener?.subscription?.unsubscribe();
          };
        }
      } catch (err) {
        console.warn('Notice checking password recovery status:', err);
        if (mounted) {
          setHasValidSession(true);
          setVerifyingSession(false);
        }
      }
    }

    checkAuthStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('token')) {
          setLinkError('Your password reset session has expired. Please request a new link.');
          return;
        }
        throw error;
      }

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password. Please try again.';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-[#0D3D2B] flex items-center justify-center text-white shadow-lg shadow-[#0D3D2B]/20 p-2.5">
          <KeyRound className="w-7 h-7 text-emerald-200" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111C16]">
          Create New Password
        </h1>
        <p className="text-xs text-stone-500 font-medium max-w-xs mx-auto">
          Choose a strong and secure password for your StudentConnect account.
        </p>
      </div>

      {verifyingSession ? (
        /* Loading / Verifying Token State */
        <div className="bg-white rounded-3xl p-10 border border-[#E5DFD5] shadow-xs text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D3D2B] mx-auto" />
          <p className="text-xs font-bold text-stone-600">Verifying security token...</p>
        </div>
      ) : linkError ? (
        /* Invalid or Expired Token State */
        <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111C16]">Reset Link Invalid or Expired</h2>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              {linkError}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/forgot-password" className="block">
              <Button variant="primary" size="md" className="w-full font-bold">
                Request a New Reset Link
              </Button>
            </Link>

            <Link href="/login" className="block">
              <Button variant="ghost" size="md" className="w-full text-xs font-bold text-stone-600">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : success ? (
        /* Success State */
        <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#0D3D2B]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111C16]">Password Updated!</h2>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Your password has been reset successfully. You can now log into your StudentConnect account with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/login" className="block">
              <Button variant="primary" size="lg" className="w-full font-bold">
                Sign In With New Password <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Form State */
        <form
          onSubmit={handleResetPassword}
          className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-5"
        >
          {formError && (
            <div className="p-3.5 rounded-2xl bg-[#FAF3E8] border border-[#ECDAB8] text-[#8C6420] text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#8C6420] shrink-0 mt-0.5" />
              <div>{formError}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-10 py-3 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">
              Must be at least 6 characters long.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-10 py-3 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Reset Password
              </span>
            )}
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              Cancel and Return to Sign In
            </Link>
          </div>
        </form>
      )}

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-stone-400 font-medium flex items-center justify-center gap-1.5">
        <LogoIcon className="w-3.5 h-3.5 text-[#0D3D2B]" />
        <span>StudentConnect Secure Authentication</span>
      </div>
    </div>
  );
}
