'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAsRole } = useApp();
  const [email, setEmail] = useState('admin@studentconnect.org');
  const [password, setPassword] = useState('••••••••••••');

  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsRole('admin');
    router.push('/admin/dashboard');
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
              Restricted back-office management console.
            </p>
          </div>
        </div>

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
              className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Lock className="w-4 h-4" />
            Authenticate Admin Session
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
