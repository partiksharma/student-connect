'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Code,
  Rocket,
  Mail,
  Layers
} from 'lucide-react';

export default function CreatorPage() {
  return (
    <div className="flex flex-col bg-[#F7F4EE] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Creator Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E5DFD5] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6F3EC]/50 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
            {/* Creator Avatar */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#0D3D2B] p-1 shadow-xl">
                <div className="w-full h-full rounded-[22px] bg-[#07261A] flex items-center justify-center text-[#34D399] text-3xl font-black">
                  PS
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#16563D] text-white p-1.5 rounded-xl shadow-md">
                <Code className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3EC] border border-[#CDE5D7] text-xs font-bold text-[#0D3D2B]">
                <Code className="w-3.5 h-3.5 text-[#0D3D2B]" />
                <span>Platform Creator & Architect</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#111C16]">
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#111C16]">The Vision Behind StudentConnect</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every year, thousands of talented university students graduate with great theoretical knowledge but struggle to land their first opportunities because of the &ldquo;need experience to get experience&rdquo; paradox.
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Meanwhile, local businesses need help with growth and tech but can&apos;t afford costly agencies. StudentConnect was created to bridge this divide through fair, structured, zero-cost collaborations.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#111C16]">Built With Modern Tech</h2>
            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]">
                <span className="font-bold text-[#0D3D2B]">Frontend:</span>
                <span>Next.js 16 (App Router, Turbopack, React 19)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]">
                <span className="font-bold text-[#0D3D2B]">Styling:</span>
                <span>Tailwind CSS & Rich Custom Color Palette</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]">
                <span className="font-bold text-[#0D3D2B]">Data & Safety:</span>
                <span>Supabase SSR Client & Client-State Engine</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FBF9F5] border border-[#E5DFD5]">
                <span className="font-bold text-[#0D3D2B]">Icons:</span>
                <span>Lucide React Icons</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
