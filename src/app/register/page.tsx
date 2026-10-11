'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  Building,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const initialRole = searchParams.get('role');
  const { registerStudent, registerBusiness } = useApp();

  const [role, setRole] = useState<'student' | 'business'>(
    initialRole === 'business' ? 'business' : 'student'
  );
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    if (error) {
      setErrorMsg(
        errorDesc
          ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
          : 'Authentication error occurred during Google registration. Please try again.'
      );
    }
  }, [searchParams]);

  // Student specific state
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [gradYear, setGradYear] = useState(2027);
  const [skills, setSkills] = useState('Social Media, Canva, Content Writing');
  const [hours, setHours] = useState(8);
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Business specific state
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Food & Beverage');
  const [businessSize, setBusinessSize] = useState('1-5');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?type=register&role=${role}`,
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
      console.error('Google sign-up error:', err);
      const msg = err instanceof Error ? err.message : 'Google sign-up failed. Please try again.';
      setErrorMsg(msg);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (role === 'student') {
        const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
        const portfolioArray = portfolioUrl ? [portfolioUrl] : [];
        await registerStudent(email, fullName, school, gradYear, skillsArray, hours, bio, portfolioArray, password);
        router.push('/student/dashboard');
      } else {
        await registerBusiness(email, businessName, industry, businessSize, location, description, websiteUrl, password);
        router.push('/business/dashboard');
      }
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details and try again.';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 space-y-2.5 sm:space-y-3">
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-3xl bg-[#0D3D2B] flex items-center justify-center text-white shadow-lg shadow-[#0D3D2B]/20 p-2 sm:p-2.5">
          <LogoIcon className="w-full h-full text-white" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#111C16] tracking-tight">
          Join StudentConnect
        </h1>
        <p className="text-xs text-stone-500 font-medium max-w-md mx-auto">
          Select your account type to get matched with real-world projects or find talented student help.
        </p>
      </div>

      {/* Role Selector Tabs (Stack on mobile, 2 cols on tablet+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`p-5 sm:p-6 rounded-3xl border text-left transition-all cursor-pointer ${
            role === 'student'
              ? 'border-[#0D3D2B] bg-[#E6F3EC] ring-2 ring-[#0D3D2B]/20 shadow-xs'
              : 'border-[#E5DFD5] bg-white hover:border-[#16563D]/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0D3D2B] text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            {role === 'student' && <Check className="w-5 h-5 text-[#0D3D2B]" />}
          </div>
          <div className="font-black text-sm text-[#111C16]">I am a Student</div>
          <div className="text-xs text-stone-500 mt-0.5 font-medium">
            Looking for real projects, verified references, and portfolio building.
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('business')}
          className={`p-5 sm:p-6 rounded-3xl border text-left transition-all cursor-pointer ${
            role === 'business'
              ? 'border-[#0D3D2B] bg-[#FAF7F2] ring-2 ring-[#0D3D2B]/20 shadow-xs'
              : 'border-[#E5DFD5] bg-white hover:border-[#16563D]/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#16563D] text-white flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            {role === 'business' && <Check className="w-5 h-5 text-[#16563D]" />}
          </div>
          <div className="font-black text-sm text-[#111C16]">I am a Small Business</div>
          <div className="text-xs text-stone-500 mt-0.5 font-medium">
            Need free project help with marketing, tech, design, or growth.
          </div>
        </button>
      </div>

      {/* Registration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="break-words flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Quick Google Sign Up */}
        <div className="space-y-3">
          <div className="text-xs font-black text-stone-900 flex items-center justify-between">
            <span>Fast Sign Up</span>
            <span className="text-[11px] font-bold text-[#0D3D2B] capitalize">
              Role: {role === 'student' ? 'Student' : 'Small Business Client'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || isSubmitting}
            className="w-full py-3 px-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF7F2] hover:bg-[#EFE9DE] text-[#111C16] font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0D3D2B] border-t-transparent rounded-full animate-spin" />
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
                <span>Continue with Google as {role === 'student' ? 'Student' : 'Business'}</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-[#E5DFD5] w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
            Or fill out profile details
          </span>
          <div className="border-t border-[#E5DFD5] w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-sm sm:text-base font-black text-[#111C16]">
            {role === 'student' ? 'Student Profile Setup' : 'Business Organization Setup'}
          </h2>

          {/* Common Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? 'student@university.edu' : 'owner@business.com'}
                className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B] transition-all"
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
                  className="w-full text-xs p-3 pr-10 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B] transition-all"
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
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <div className="space-y-4 pt-2 border-t border-[#E5DFD5]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    School / University
                  </label>
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. University of Washington"
                    className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value))}
                    className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Availability (Hours/Week)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value))}
                    className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Skills & Interests (Comma-separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Social Media, Next.js, Canva, Figma, Copywriting..."
                  className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Bio & Career Goal
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your major and what you want to achieve with small businesses..."
                  className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                />
              </div>
            </div>
          )}

          {/* Business Specific Fields */}
          {role === 'business' && (
            <div className="space-y-4 pt-2 border-t border-[#E5DFD5]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Pacific Coast Roastery"
                    className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Retail, Food, Services, Creative"
                    className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Location (City, State)
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Seattle, WA"
                    className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your small business do and who do you serve?"
                  className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-[#FBF9F5] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                />
              </div>
            </div>
          )}

          {/* Terms of Service Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#E6F3EC] border border-[#CDE5D7] text-[11px] text-stone-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#0D3D2B]">
              <ShieldCheck className="w-4 h-4 text-[#16563D]" />
              Terms of Service & Experiential Guarantee
            </div>
            <p>
              By joining, you agree that StudentConnect engagements are unpaid experiential learning projects designed for educational value and references.
            </p>
          </div>

          <Button
            type="submit"
            variant={role === 'student' ? 'primary' : 'yellow'}
            size="lg"
            className="w-full font-bold"
            isLoading={isSubmitting}
            disabled={googleLoading || isSubmitting}
          >
            Create Free {role === 'student' ? 'Student' : 'Business'} Account
          </Button>

          <div className="text-center text-xs text-stone-500 pt-1 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0D3D2B] font-black hover:underline">
              Sign In Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Loading registration form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
