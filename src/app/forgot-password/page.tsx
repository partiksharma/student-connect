'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Send,
  HelpCircle
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${origin}/auth/callback?next=/reset-password`;

      // 1. Send via Supabase client directly
      let sentSuccessfully = false;
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });
        if (!error) {
          sentSuccessfully = true;
        }
      } catch (clientErr) {
        console.warn('Client Supabase reset notice:', clientErr);
      }

      // 2. Also notify backend API for server-side logging and backup dispatch
      try {
        await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, redirectTo: redirectUrl }),
        });
      } catch (apiErr) {
        console.warn('API reset dispatch notice:', apiErr);
      }

      setSubmitted(true);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while requesting password reset.';
      setErrorMsg(msg);
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
          Reset Your Password
        </h1>
        <p className="text-xs text-stone-500 font-medium max-w-xs mx-auto">
          Enter your registered email address and we&apos;ll send you a secure link to reset your account password.
        </p>
      </div>

      {submitted ? (
        /* Success State */
        <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#0D3D2B]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111C16]">Check Your Email</h2>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              We&apos;ve sent a password reset link to <strong className="text-stone-900 font-bold">{email}</strong>. Please check your inbox (and spam folder) and follow the link to create a new password.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D3D2B]">
              <HelpCircle className="w-4 h-4 text-[#16563D] shrink-0" />
              <span>Didn&apos;t receive the email?</span>
            </div>
            <ul className="text-[11px] text-stone-500 space-y-1 list-disc list-inside">
              <li>Check your junk or spam folder.</li>
              <li>Make sure you entered the email used when registering.</li>
              <li>Links expire after 1 hour for your security.</li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full font-bold"
              disabled={resendCooldown > 0 || loading}
              onClick={handleSubmit}
            >
              {resendCooldown > 0 ? (
                `Resend Email in ${resendCooldown}s`
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Resend Reset Link
                </span>
              )}
            </Button>

            <Link href="/login" className="block">
              <Button variant="ghost" size="md" className="w-full text-xs font-bold text-stone-600">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Form State */
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-5"
        >
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-[#FAF3E8] border border-[#ECDAB8] text-[#8C6420] text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#8C6420] shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">
              Works for both Student and Client Business accounts.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Sending Reset Link...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Reset Link
              </span>
            )}
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D3D2B] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
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
