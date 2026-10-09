'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Project } from '@/lib/types/database';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building,
  GraduationCap,
  Briefcase,
  Star,
  Check,
  Search,
  Award,
  TrendingUp,
  Target,
  Compass
} from 'lucide-react';

export default function LandingPage() {
  const { projects, currentUser, applyToProject, feedbackList } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProjectForApply, setSelectedProjectForApply] = useState<Project | null>(null);
  const [pitchNote, setPitchNote] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  const openProjects = projects.filter((p) => p.status === 'open');

  const filteredProjects = selectedCategory === 'all'
    ? openProjects
    : openProjects.filter((p) => p.category === selectedCategory || (selectedCategory === 'marketing' && p.category === 'social_media'));

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForApply) return;
    try {
      await applyToProject(selectedProjectForApply.id, pitchNote);
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedProjectForApply(null);
        setPitchNote('');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Please login as a student to apply';
      alert(msg);
    }
  };

  return (
    <div className="flex flex-col bg-[#F7F4EE]">
      {/* 1. HERO SECTION (Styled like reference screenshot) */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-28 bg-[#F7F4EE] border-b border-[#E5DFD5]">
        {/* Decorative background geometric accents */}
        <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-[#E6F3EC]/50 pointer-events-none" />
        <div className="absolute bottom-6 left-10 w-24 h-24 rounded-full bg-[#16563D]/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="space-y-6 flex flex-col items-center">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE9DE] border border-[#DDD5C7] text-xs font-bold text-[#0D3D2B] shadow-2xs">
              <span>Empowering Tomorrow&apos;s Builders</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111C16] tracking-tight leading-[1.12]">
              I&apos;m Student <span className="text-[#0D3D2B]">Ready to Build!</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl font-medium">
              Not simulations, not busywork. Students deliver real marketing, web dev, and brand design for small businesses — completely free, for verifiable references and portfolio growth.
            </p>

            {/* Pill Action Buttons (Forest Primary + Warm Secondary) */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/projects">
                <Button size="lg" variant="primary">
                  Explore Projects
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>

              <Link href="/business/projects/new">
                <Button size="lg" variant="secondary">
                  Post a Project Need
                </Button>
              </Link>
            </div>

            {/* Client Review Proof Stack (Matching reference layout) */}
            <div className="pt-4 flex items-center justify-center gap-4">
              {/* Avatar Stack */}
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Student 1"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Student 2"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Student 3"
                />
                <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-white bg-[#0D3D2B] text-[#34D399] font-black text-xs items-center justify-center">
                  +40
                </div>
              </div>

              {/* Rating copy */}
              <div className="text-left">
                <div className="flex items-center gap-1 text-[#C89238]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C89238]" />
                  ))}
                </div>
                <div className="text-xs font-extrabold text-[#111C16] mt-0.5">
                  Verified Reviews <span className="text-[#0D3D2B] font-bold cursor-pointer hover:underline">• 100% Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* 3. FEATURED LIVE PROJECTS MARKETPLACE */}
      <section className="py-20 bg-[#FAF7F2] border-b border-[#E5DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-[#0D3D2B] mb-1">
                LAYOUT & PROJECT PACKS
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111C16]">
                Active Small Business Projects
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                Browse open listings across marketing, web development, brand design, and content creation.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'marketing', label: 'Marketing' },
                { id: 'web_tech', label: 'Web & Tech' },
                { id: 'design', label: 'UI/UX & Design' },
                { id: 'content', label: 'Content Writing' },
                { id: 'data_analytics', label: 'Data & AI' },
                { id: 'video_media', label: 'Video & Media' },
                { id: 'finance', label: 'Finance' },
                { id: 'research', label: 'Market Research' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#0D3D2B] text-white shadow-md shadow-[#0D3D2B]/20'
                      : 'bg-white border border-[#E5DFD5] text-stone-700 hover:bg-[#EFE9DE]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onApply={(proj) => {
                  setSelectedProjectForApply(proj);
                }}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/projects">
              <Button size="lg" variant="primary">
                View All Open Projects
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE & MISSION SPLIT SECTION */}
      <section className="py-20 bg-white border-b border-[#E5DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image with Forest Green Accent */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-[#F7F4EE] p-4 border border-[#E5DFD5]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
                  alt="Student Experience"
                  className="w-full h-[420px] object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#0D3D2B] -z-0" />
            </div>

            {/* Right Details: Experience & Mission/Vision Cards */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-[11px] font-black uppercase tracking-widest text-[#0D3D2B]">
                DETAILS ABOUT EXPERIENCE
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111C16] leading-tight">
                Empowering Students with Genuine Client Experience
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                We believe practical, hands-on work should not be gatekept by unpaid full-time agency internships or personal connections. By connecting university students directly with local small businesses, we create measurable outcomes for both sides.
              </p>

              {/* Vision and Mission Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E5DFD5] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0D3D2B] text-white flex items-center justify-center">
                    <Target className="w-4 h-4 text-[#34D399]" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#111C16]">Our Vision</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    A world where every graduating student enters the workforce with a verified portfolio of real business deliverables.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E5DFD5] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#16563D] text-white flex items-center justify-center">
                    <Compass className="w-4 h-4 text-[#A7F3D0]" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#111C16]">Our Mission</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Provide 100% free, structured project engagements that help local businesses thrive and students excel.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. VERIFIED CLIENT REVIEWS (Deep Forest Green section) */}
      <section className="py-20 bg-[#0D3D2B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#34D399]">
              PROVEN OUTCOMES
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-white">
              Verified Business Reviews & Testimonials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {feedbackList.map((fb) => (
              <div
                key={fb.id}
                className="bg-[#07261A] rounded-3xl p-7 border border-[#34D399]/20 space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-1 text-[#FBBF24]">
                  {[...Array(fb.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FBBF24]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-emerald-50/90 italic leading-relaxed">
                  &ldquo;{fb.testimonial}&rdquo;
                </p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{fb.author_name}</div>
                    <div className="text-[#34D399] capitalize text-[11px]">{fb.author_role} Partner</div>
                  </div>
                  <span className="text-[11px] px-3 py-1 rounded-full bg-[#0D3D2B] text-emerald-200 border border-[#34D399]/30 font-medium">
                    {fb.project_title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-20 bg-[#F7F4EE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-[#111C16]">
            Ready to build real experience or empower your small business?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button size="lg" variant="primary">
                Create Free Account
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline">
                Find Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Apply to Project Modal */}
      {selectedProjectForApply && (
        <Modal
          isOpen={!!selectedProjectForApply}
          onClose={() => setSelectedProjectForApply(null)}
          title={`Apply to: ${selectedProjectForApply.title}`}
          description={`Submit your pitch to ${selectedProjectForApply.business?.business_name || 'Business'}`}
        >
          {applySuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-stone-900">
                Application Submitted!
              </h4>
              <p className="text-xs text-stone-500">
                The business owner has received your pitch and will review your profile.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Why are you a good fit for this project?
                </label>
                <textarea
                  rows={4}
                  required
                  value={pitchNote}
                  onChange={(e) => setPitchNote(e.target.value)}
                  placeholder="Mention your relevant skills, past coursework, and ideas..."
                  className="w-full text-xs p-3 rounded-2xl border border-[#E5DFD5] bg-white text-stone-900 focus:ring-2 focus:ring-[#0D3D2B] outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#F4F9F6] border border-[#D6EADB] text-xs text-stone-600">
                <span className="font-bold text-[#0D3D2B]">Commitment:</span> ~{selectedProjectForApply.estimated_hours_per_week} hrs/week for {selectedProjectForApply.duration_weeks} weeks.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProjectForApply(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
