'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import {
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-[#0D3D2B] flex items-center justify-center text-white shadow-lg shadow-[#0D3D2B]/20 p-2.5">
          <LogoIcon className="w-full h-full text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111C16]">
          Welcome to StudentConnect
        </h1>
        <p className="text-xs text-stone-500 font-medium">
          Access your workspaces, projects, or client dashboard.
        </p>
      </div>

      {/* Standard Form */}
      <form
        onSubmit={handleFormLogin}
        className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-4"
      >
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-[#FAF3E8] border border-[#ECDAB8] text-[#8C6420] text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#8C6420] shrink-0 mt-0.5" />
            <div>
              {errorMsg}
              <div className="mt-2">
                <Link
                  href={`/register?email=${encodeURIComponent(email)}`}
                  className="inline-block px-3 py-1.5 bg-[#0D3D2B] text-white rounded-xl font-bold text-[11px] shadow-xs hover:bg-[#08281A]"
                >
                  Create Account Now →
                </Link>
              </div>
            </div>
          </div>
        )}

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
            className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
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
              className="w-full text-xs p-3 pr-10 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
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

        <Button type="submit" variant="primary" size="lg" className="w-full font-bold" disabled={loading}>
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
  );
}
