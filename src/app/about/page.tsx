'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Award,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ArrowRight
} from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="flex flex-col bg-[#F7F4EE] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-[#F7F4EE] border-b border-[#E5DFD5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F3EC] border border-[#CDE5D7] text-xs font-bold text-[#0D3D2B]">
            <Award className="w-3.5 h-3.5 text-[#0D3D2B]" />
            <span>Our Mission & Vision</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111C16] tracking-tight">
            Bridging the gap between <br />
            <span className="text-[#0D3D2B]">Ambitious Students</span> & <span className="text-[#16563D]">Local Businesses</span>
          </h1>

          <p className="text-sm sm:text-base text-[#526058] max-w-2xl mx-auto leading-relaxed font-medium">
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
          <h2 className="text-xs font-black uppercase tracking-widest text-[#0D3D2B] mb-2">
            Why StudentConnect Exists
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-[#111C16]">
            Real impact, zero corporate bureaucracy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#111C16]">Experience Over Simulations</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Textbook cases and artificial bootcamp assignments can only go so far. We provide direct access to live business needs so students gain genuine project leadership and testimonials.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F3EC] text-[#16563D] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#111C16]">Empowering Small Businesses</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Independent cafes, local boutiques, and early startups rarely have big marketing budgets. StudentConnect unlocks fresh, innovative talent for scoped backlog tasks at zero monetary cost.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#111C16]">Safety & Moderation First</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every project posting and account undergoes review to prevent exploitation, ensure fair scopes (3–8 hrs/week), and guarantee verified student credit and references.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Numbers */}
      <section className="py-16 bg-[#FAF7F2] border-y border-[#E5DFD5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-[#0D3D2B]">100%</div>
              <div className="text-xs font-bold text-stone-600 mt-1">Free Platform Guarantee</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-[#16563D]">12+</div>
              <div className="text-xs font-bold text-stone-600 mt-1">Project Categories</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-[#0D3D2B]">3–8 hrs</div>
              <div className="text-xs font-bold text-stone-600 mt-1">Flexible Weekly Scope</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-[#16563D]">Verified</div>
              <div className="text-xs font-bold text-stone-600 mt-1">Public Portfolio Reviews</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
