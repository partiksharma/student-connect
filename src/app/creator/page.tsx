'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Code,
  Sparkles,
  Rocket,
  Heart,
  Globe,
  Mail,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function CreatorPage() {
  return (
    <div className="flex flex-col bg-[#FCF9F6] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Creator Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#F0E4DC] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E59819]/15 via-[#7A1C2E]/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
            {/* Creator Avatar */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#7A1C2E] to-[#E59819] p-1 shadow-xl">
                <div className="w-full h-full rounded-[22px] bg-[#58111F] flex items-center justify-center text-amber-200 text-3xl font-black">
                  PS
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#E59819] text-[#2A151B] p-1.5 rounded-xl shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900">
                <Code className="w-3.5 h-3.5 text-amber-700" />
                <span>Platform Creator & Architect</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#2A151B]">
                Pratik Sharma
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium max-w-xl">
                Passionate software developer and builder focused on crafting impactful web applications that solve real-world community problems.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <Link href="/contact">
                  <Button size="sm" variant="primary">
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    Get in Touch
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="sm" variant="yellow">
                    Explore Platform
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Story & Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E4DC] space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#7A1C2E] flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#2A151B]">The Vision Behind StudentConnect</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every year, thousands of talented university students graduate with great theoretical knowledge but struggle to land their first opportunities because of the &ldquo;need experience to get experience&rdquo; paradox.
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Meanwhile, local businesses need help with growth and tech but can&apos;t afford costly agencies. StudentConnect was created to bridge this divide through fair, structured, zero-cost collaborations.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E4DC] space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1C2E]/10 text-[#7A1C2E] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#2A151B]">Built With Modern Tech</h2>
            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FCF9F6] border border-[#F0E4DC]">
                <span className="font-bold text-[#7A1C2E]">Frontend:</span>
                <span>Next.js 16 (App Router, Turbopack, React 19)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FCF9F6] border border-[#F0E4DC]">
                <span className="font-bold text-[#7A1C2E]">Styling:</span>
                <span>Tailwind CSS & Rich Custom Color Palette</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FCF9F6] border border-[#F0E4DC]">
                <span className="font-bold text-[#7A1C2E]">Data & Safety:</span>
                <span>Supabase SSR Client & Client-State Engine</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FCF9F6] border border-[#F0E4DC]">
                <span className="font-bold text-[#7A1C2E]">Icons:</span>
                <span>Lucide React Icons</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
