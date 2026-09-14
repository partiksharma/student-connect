'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  Building,
  UserCheck
} from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = (role: 'student' | 'business') => {
    loginAsRole(role);
    if (role === 'student') router.push('/student/dashboard');
    else router.push('/business/dashboard');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleDemoLogin('student');
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-[#7A1C2E] flex items-center justify-center text-white shadow-lg shadow-[#7A1C2E]/20 p-2.5">
          <LogoIcon className="w-full h-full text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A151B]">
          Welcome to StudentConnect
        </h1>
        <p className="text-xs text-stone-500 font-medium">
          Access your workspaces, projects, or applications.
        </p>
      </div>

      {/* Quick Demo Sign In Box */}
      <div className="p-5 rounded-3xl bg-[#FFF8F3] border border-[#F0E4DC] space-y-3">
        <div className="text-xs font-black text-[#7A1C2E] flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-[#E59819]" />
          Quick Demo Persona Login
        </div>
        <p className="text-[11px] text-stone-600 font-medium">
          Click either persona to test with full sample data:
        </p>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleDemoLogin('student')}
            className="text-xs py-2.5"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
            Student Persona
          </Button>
          <Button
            size="sm"
            variant="yellow"
            onClick={() => handleDemoLogin('business')}
            className="text-xs py-2.5"
          >
            <Building className="w-3.5 h-3.5 mr-1.5" />
            Small Business
          </Button>
        </div>
      </div>

      {/* Standard Form */}
      <form
        onSubmit={handleFormLogin}
        className="bg-white rounded-3xl p-8 border border-[#F0E4DC] shadow-xs space-y-4"
      >
        <div>
          <label className="block text-xs font-bold text-stone-800 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-800 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Sign In
        </Button>

        <div className="text-center text-xs text-stone-500 pt-2 font-medium">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="text-[#7A1C2E] font-black hover:underline">
            Register Free
          </Link>
        </div>
      </form>
    </div>
  );
}
