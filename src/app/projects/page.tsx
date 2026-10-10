'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Project } from '@/lib/types/database';
import { Search, Filter, Check, Briefcase } from 'lucide-react';

export default function ProjectsMarketplacePage() {
  const { projects, applyToProject, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProjectForApply, setSelectedProjectForApply] = useState<Project | null>(null);
  const [pitchNote, setPitchNote] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const openProjects = projects.filter((p) => p.status === 'open');

  const filtered = openProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills_required.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.business?.business_name && p.business.business_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForApply || isSubmitting) return;

    if (!currentUser) {
      setApplyError('Please log in with a verified student account to apply to projects.');
      return;
    }

    if (currentUser.role !== 'student') {
      setApplyError('Only student accounts can submit project applications.');
      return;
    }

    setIsSubmitting(true);
    setApplyError(null);

    try {
      await applyToProject(selectedProjectForApply.id, pitchNote);
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedProjectForApply(null);
        setPitchNote('');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application';
      setApplyError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-[#111C16] tracking-tight">
          Project Marketplace
        </h1>
        <p className="text-xs text-stone-500 mt-1 max-w-2xl font-medium">
          Apply to genuine project postings created by local and independent small businesses. Gain verified experience and references.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5DFD5] shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill, business, or keyword..."
            className="w-full text-xs pl-11 pr-4 py-3 rounded-full border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-[#0D3D2B]" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-4 py-2.5 rounded-full border border-stone-200 bg-[#FAF7F2] text-stone-800 font-semibold outline-none focus:ring-2 focus:ring-[#0D3D2B]"
          >
            <option value="all">All Categories</option>
            <option value="marketing">Marketing & Growth</option>
            <option value="web_tech">Web & Software Tech</option>
            <option value="design">UI/UX & Graphic Design</option>
            <option value="content">Content & Copywriting</option>
            <option value="data_analytics">Data & AI Analytics</option>
            <option value="video_media">Video Editing & Animation</option>
            <option value="social_media">Social Media & Community</option>
            <option value="finance">Finance & Accounting</option>
            <option value="operations">Operations & Strategy</option>
            <option value="research">Market Research & Insights</option>
            <option value="sales">Sales & Lead Generation</option>
            <option value="other">Other Projects</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onApply={(proj) => {
              setApplyError(null);
              setSelectedProjectForApply(proj);
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E5DFD5] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No projects found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters to discover other opportunities.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Apply Modal */}
      {selectedProjectForApply && (
        <Modal
          isOpen={!!selectedProjectForApply}
          onClose={() => {
            if (!isSubmitting) {
              setSelectedProjectForApply(null);
              setApplyError(null);
            }
          }}
          title={`Apply to: ${selectedProjectForApply.title}`}
          description={`Submitting application to ${selectedProjectForApply.business?.business_name || 'Business'}`}
        >
          {applySuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-stone-900">Application Submitted!</h4>
              <p className="text-xs text-stone-500">
                The business will review your pitch and skills.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              {applyError && (
                <div className="p-3.5 rounded-2xl bg-[#FAF3E8] border border-[#ECDAB8] text-[#8C6420] text-xs font-semibold space-y-2">
                  <div>{applyError}</div>
                  {!currentUser && (
                    <div className="flex items-center gap-2 pt-1">
                      <Link href="/login" className="inline-block px-3 py-1 bg-[#0D3D2B] text-white rounded-xl font-bold text-[11px] hover:bg-[#08281A]">
                        Log In
                      </Link>
                      <Link href="/register" className="inline-block px-3 py-1 bg-white border border-[#0D3D2B] text-[#0D3D2B] rounded-xl font-bold text-[11px] hover:bg-[#FAF7F2]">
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Why are you interested in this project?
                </label>
                <textarea
                  rows={4}
                  required
                  value={pitchNote}
                  onChange={(e) => setPitchNote(e.target.value)}
                  placeholder="Introduce yourself, highlight relevant tools or experience..."
                  className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#F4F9F6] text-xs text-stone-600 border border-[#D6EADB]">
                <div className="font-bold text-[#0D3D2B]">
                  Commitment: {selectedProjectForApply.estimated_hours_per_week} hrs/week • {selectedProjectForApply.duration_weeks} weeks
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => {
                    setSelectedProjectForApply(null);
                    setApplyError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Send Application
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
