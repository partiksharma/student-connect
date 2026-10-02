'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  Building,
  UserCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsRole, loginWithEmail } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoLogin = (role: 'student' | 'business') => {
    loginAsRole(role);
    if (role === 'student') router.push('/student/dashboard');
    else router.push('/business/dashboard');
  };

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
          router.push('/admin/reports');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        setErrorMsg('No registered profile found for this email. Please click "Register Free" below to create your account in the database!');
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
          Access your workspaces, projects, or applications.
        </p>
      </div>

      {/* Quick Demo Sign In Box */}
      <div className="p-5 rounded-3xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-3">
        <div className="text-xs font-black text-[#0D3D2B] flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-[#16563D]" />
          Quick Demo Persona Login
        </div>
        <p className="text-[11px] text-stone-600 font-medium">
          Click any persona to test with full sample data:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleDemoLogin('student')}
            className="text-[11px] py-2"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1" />
            Sarah (Student)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              setLoading(true);
              await loginWithEmail('nextphase');
              router.push('/business/dashboard');
            }}
            className="text-[11px] py-2 font-bold bg-[#0D3D2B] text-white hover:bg-[#08281A]"
          >
            <Building className="w-3.5 h-3.5 mr-1" />
            nextphase (Client)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDemoLogin('business')}
            className="text-[11px] py-2 font-bold"
          >
            <Building className="w-3.5 h-3.5 mr-1" />
            Bakery Client
          </Button>
        </div>
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
            Email or Client ID (e.g. nextphase)
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nextphase or you@example.com"
            className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-800 mb-1">
            Password
          </label>
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
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="text-center text-xs text-stone-500 pt-2 font-medium">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="text-[#0D3D2B] font-black hover:underline">
            Register Free
          </Link>
        </div>
      </form>
    </div>
  );
}
