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
  Sparkles,
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
    : openProjects.filter((p) => p.category === selectedCategory);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForApply) return;
    try {
      applyToProject(selectedProjectForApply.id, pitchNote);
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
    <div className="flex flex-col bg-[#FCF9F6]">
      {/* 1. HERO SECTION (Styled like reference screenshot) */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-[#FFF8F3] border-b border-[#F0E4DC]">
        {/* Decorative background geometric circle */}
        <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#E59819]/10 via-[#7A1C2E]/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-10 w-24 h-24 rounded-full bg-[#E59819]/15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Typography & Actions */}
            <div className="lg:col-span-6 space-y-6">
              {/* Main Reference Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2A151B] tracking-tight leading-[1.12]">
                I&apos;m Student <br />
                <span className="text-[#7A1C2E]">Ready to Build!</span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg font-medium">
                Not simulations, not busywork. Students deliver real marketing, web dev, and brand design for small businesses — completely free, for verifiable references and portfolio growth.
              </p>

              {/* Pill Action Buttons (Maroon Primary + Warm Secondary) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/projects">
                  <Button size="lg" variant="primary">
                    Explore Projects
                  </Button>
                </Link>

                <Link href="/business/projects/new">
                  <Button size="lg" variant="yellow">
                    Post a Project Need
                  </Button>
                </Link>
              </div>

              {/* Client Review Proof Stack (Matching reference layout) */}
              <div className="pt-4 flex items-center gap-4">
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
                  <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-white bg-[#7A1C2E] text-amber-200 font-black text-xs items-center justify-center">
                    +40
                  </div>
                </div>

                {/* Rating copy */}
                <div>
                  <div className="flex items-center gap-1 text-[#E59819]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#E59819]" />
                    ))}
                  </div>
                  <div className="text-xs font-extrabold text-[#2A151B] mt-0.5">
                    Verified Reviews <span className="text-[#7A1C2E] font-bold cursor-pointer hover:underline">• 100% Free</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Portrait with Floating Badges (Reference layout) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Circular Graphic Accents */}
              <div className="absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full border-2 border-dashed border-[#E59819]/40 -z-0" />
              <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-gradient-to-tr from-[#7A1C2E]/10 via-[#E59819]/15 to-transparent -z-0" />
              <div className="absolute top-4 right-6 w-12 h-12 rounded-full bg-[#E59819] -z-0 shadow-lg shadow-amber-500/20" />

              {/* Main Student Portrait Image */}
              <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"
                  alt="Student Collaborator"
                  className="w-full h-auto max-h-[460px] object-cover rounded-3xl shadow-2xl border-4 border-white"
                />

                {/* Floating Badge 1 (Top Left) */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-xl border border-amber-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-[#2A151B]">Top Rated Student</div>
                    <div className="text-[10px] text-stone-400 font-semibold">Award Winner 2026</div>
                  </div>
                </div>

                {/* Floating Badge 2 (Bottom Right) */}
                <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white rounded-2xl p-3.5 shadow-xl border border-amber-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-9 h-9 rounded-xl bg-[#7A1C2E] text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-[#2A151B]">My Projects</div>
                    <div className="text-[10px] text-[#7A1C2E] font-bold">100% Completed</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 3. FEATURED LIVE PROJECTS MARKETPLACE */}
      <section className="py-20 bg-[#FCF9F6] border-b border-[#F0E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-[#7A1C2E] mb-1">
                LAYOUT & PROJECT PACKS
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#2A151B]">
                Active Small Business Projects
              </h2>
              <p className="text-xs text-stone-500 mt-1">
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
                      ? 'bg-[#7A1C2E] text-white shadow-md shadow-[#7A1C2E]/20'
                      : 'bg-white border border-[#F0E4DC] text-stone-700 hover:bg-[#F5ECE5]'
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

      {/* 4. EXPERIENCE & MISSION SPLIT SECTION (Matching bottom of reference image) */}
      <section className="py-20 bg-white border-b border-[#F0E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image with Maroon & Yellow Accents */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-[#FFF8F3] p-4 border border-[#F0E4DC]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
                  alt="Student Experience"
                  className="w-full h-[420px] object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#E59819] -z-0" />
            </div>

            {/* Right Details: Experience & Mission/Vision Cards */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-[11px] font-black uppercase tracking-widest text-[#7A1C2E]">
                DETAILS ABOUT EXPERIENCE
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#2A151B] leading-tight">
                Empowering Students with Genuine Client Experience
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                We believe practical, hands-on work should not be gatekept by unpaid full-time agency internships or personal connections. By connecting university students directly with local small businesses, we create measurable outcomes for both sides.
              </p>

              {/* Vision and Mission Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#FFF8F3] border border-[#F0E4DC] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#7A1C2E] text-white flex items-center justify-center">
                    <Target className="w-4 h-4 text-amber-200" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#2A151B]">Our Vision</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    A world where every graduating student enters the workforce with a verified portfolio of real business deliverables.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFF8F3] border border-[#F0E4DC] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E59819] text-slate-950 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#2A151B]">Our Mission</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Provide 100% free, structured project engagements that help local businesses thrive and students excel.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. VERIFIED CLIENT REVIEWS */}
      <section className="py-20 bg-[#58111F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-300">
              PROVEN OUTCOMES
            </h2>
            <p className="text-2xl sm:text-3xl font-black">
              Verified Business Reviews & Testimonials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {feedbackList.map((fb) => (
              <div
                key={fb.id}
                className="bg-[#420C17] rounded-3xl p-7 border border-amber-500/20 space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-1 text-[#E59819]">
                  {[...Array(fb.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#E59819]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-amber-100 italic leading-relaxed">
                  &ldquo;{fb.testimonial}&rdquo;
                </p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{fb.author_name}</div>
                    <div className="text-amber-300 capitalize text-[11px]">{fb.author_role} Partner</div>
                  </div>
                  <span className="text-[11px] px-3 py-1 rounded-full bg-[#58111F] text-amber-200 border border-amber-500/30 font-medium">
                    {fb.project_title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-[#2A151B]">
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
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-white text-stone-900 focus:ring-2 focus:ring-[#7A1C2E] outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#FFF8F3] border border-[#F0E4DC] text-xs text-stone-600">
                <span className="font-bold text-[#7A1C2E]">Commitment:</span> ~{selectedProjectForApply.estimated_hours_per_week} hrs/week for {selectedProjectForApply.duration_weeks} weeks.
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
