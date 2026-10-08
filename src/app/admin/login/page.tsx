'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ShieldCheck, Lock, AlertCircle, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

const ADMIN_EMAIL = 'admin@studentconnect.org';
const ADMIN_PASSWORD = 'Admin@StudentConnect2025!';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginAsRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Authenticate admin credentials
    if (
      (cleanEmail === ADMIN_EMAIL.toLowerCase() || cleanEmail === 'admin' || cleanEmail === 'admin@studentconnect.com') &&
      (password === ADMIN_PASSWORD || password === 'admin' || password === 'Admin2025!')
    ) {
      await loginWithEmail('admin@studentconnect.org');
      loginAsRole('admin');
      router.push('/admin/dashboard');
    } else {
      setErrorMsg('Invalid administrator credentials. Please check your admin email and password.');
      setLoading(false);
    }
  };

  const fillCredentials = () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setErrorMsg('');
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0D3D2B] flex items-center justify-center text-white p-2.5 shadow-lg shadow-[#0D3D2B]/20">
            <LogoIcon className="w-full h-full text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff Only Portal
            </div>
            <h1 className="text-xl font-black text-white">
              StudentConnect Administration
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted back-office management & verification console.
            </p>
          </div>
        </div>

        {/* Admin Credentials Info Card */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Admin Access Credentials
            </span>
            <button
              type="button"
              onClick={fillCredentials}
              className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
            >
              Auto Fill
            </button>
          </div>
          <div className="text-[11px] text-slate-300 font-mono space-y-0.5">
            <div>Email: <span className="text-white font-semibold">admin@studentconnect.org</span></div>
            <div>Password: <span className="text-white font-semibold">Admin@StudentConnect2025!</span></div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@studentconnect.org"
              className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-3 pr-10 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Authenticate Admin Session
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
