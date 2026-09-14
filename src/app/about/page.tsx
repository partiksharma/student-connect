'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Heart,
  Users,
  Award,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="flex flex-col bg-[#FCF9F6] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-[#FFF8F3] border-b border-[#F0E4DC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Our Mission & Vision</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2A151B] tracking-tight">
            Bridging the gap between <br />
            <span className="text-[#7A1C2E]">Ambitious Students</span> & <span className="text-[#E59819]">Local Businesses</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed font-medium">
            StudentConnect is a 100% free, experiential platform designed to help university students build verified, real-world portfolio proof while empowering small and independent businesses to thrive.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/projects">
              <Button size="lg" variant="primary">
                Explore Projects
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/creator">
              <Button size="lg" variant="yellow">
                Meet the Creator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#7A1C2E] mb-2">
            Why StudentConnect Exists
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-[#2A151B]">
            Real impact, zero corporate bureaucracy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#F0E4DC] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1C2E]/10 text-[#7A1C2E] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Experience Over Simulations</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Textbook cases and artificial bootcamp assignments can only go so far. We provide direct access to live business needs so students gain genuine project leadership and testimonials.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F0E4DC] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E59819]/20 text-[#8E2237] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Empowering Small Businesses</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Independent cafes, local boutiques, and early startups rarely have big marketing budgets. StudentConnect unlocks fresh, innovative talent for scoped backlog tasks at zero monetary cost.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F0E4DC] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Safety & Moderation First</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every project posting and account undergoes review to prevent exploitation, ensure fair scopes (3–8 hrs/week), and guarantee verified student credit and references.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Numbers */}
      <section className="py-16 bg-[#FFF8F3] border-y border-[#F0E4DC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-[#7A1C2E]">100%</div>
              <div className="text-xs font-bold text-stone-600 mt-1">Free Platform Guarantee</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-[#E59819]">12+</div>
              <div className="text-xs font-bold text-stone-600 mt-1">Project Categories</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-[#7A1C2E]">3–8 hrs</div>
              <div className="text-xs font-bold text-stone-600 mt-1">Flexible Weekly Scope</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-[#E59819]">Verified</div>
              <div className="text-xs font-bold text-stone-600 mt-1">Public Portfolio Reviews</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
