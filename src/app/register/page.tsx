'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  Building,
  ShieldCheck,
  Check
} from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

export default function RegisterPage() {
  const router = useRouter();
  const { registerStudent, registerBusiness } = useApp();

  const [role, setRole] = useState<'student' | 'business'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (role === 'student') {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const portfolioArray = portfolioUrl ? [portfolioUrl] : [];
      registerStudent(email, fullName, school, gradYear, skillsArray, hours, bio, portfolioArray);
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 1000);
    } else {
      registerBusiness(email, businessName, industry, businessSize, location, description, websiteUrl);
      setTimeout(() => {
        router.push('/business/dashboard');
      }, 1000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-[#7A1C2E] flex items-center justify-center text-white shadow-lg shadow-[#7A1C2E]/20 p-2.5">
          <LogoIcon className="w-full h-full text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#2A151B] tracking-tight">
          Join StudentConnect
        </h1>
        <p className="text-xs text-stone-500 font-medium">
          Select your account type to get matched with real-world projects or find talented student help.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
            role === 'student'
              ? 'border-[#7A1C2E] bg-[#FFF8F3] ring-2 ring-[#7A1C2E]/20'
              : 'border-[#F0E4DC] bg-white hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1C2E] text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            {role === 'student' && <Check className="w-5 h-5 text-[#7A1C2E]" />}
          </div>
          <div className="font-black text-sm text-[#2A151B]">I am a Student</div>
          <div className="text-xs text-stone-500 mt-0.5 font-medium">
            Looking for real projects, verified references, and portfolio building.
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('business')}
          className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
            role === 'business'
              ? 'border-[#E59819] bg-[#FFFDF9] ring-2 ring-amber-500/20'
              : 'border-[#F0E4DC] bg-white hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#E59819] text-slate-950 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            {role === 'business' && <Check className="w-5 h-5 text-amber-600" />}
          </div>
          <div className="font-black text-sm text-[#2A151B]">I am a Small Business</div>
          <div className="text-xs text-stone-500 mt-0.5 font-medium">
            Need free project help with marketing, tech, design, or growth.
          </div>
        </button>
      </div>

      {/* Registration Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 border border-[#F0E4DC] shadow-xs space-y-6"
      >
        <h2 className="text-base font-black text-[#2A151B]">
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
        </div>

        {/* Student Specific Fields */}
        {role === 'student' && (
          <div className="space-y-4 pt-2 border-t border-[#F2E7DF]">
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
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
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
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
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
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
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
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
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
                className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
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
                className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
              />
            </div>
          </div>
        )}

        {/* Business Specific Fields */}
        {role === 'business' && (
          <div className="space-y-4 pt-2 border-t border-[#F2E7DF]">
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
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
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
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Team Size
                </label>
                <select
                  value={businessSize}
                  onChange={(e) => setBusinessSize(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                >
                  <option value="1-5">1-5 Employees</option>
                  <option value="6-20">6-20 Employees</option>
                  <option value="20+">20+ Employees</option>
                </select>
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
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
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
                className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
              />
            </div>
          </div>
        )}

        {/* Terms of Service Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-[#F0E4DC] text-[11px] text-stone-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#7A1C2E]">
            <ShieldCheck className="w-4 h-4 text-[#E59819]" />
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
          className="w-full"
          isLoading={isSubmitting}
        >
          Create Free {role === 'student' ? 'Student' : 'Business'} Account
        </Button>
      </form>
    </div>
  );
}
