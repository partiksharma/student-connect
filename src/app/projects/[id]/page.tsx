'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCategoryName, getCategoryBadgeClass, formatDate } from '@/lib/utils';
import {
  Clock,
  Calendar,
  Building,
  MapPin,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Check,
  Share2,
  ShieldCheck
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, currentUser, applyToProject } = useApp();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [pitchNote, setPitchNote] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const projectId = params?.id as string;
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Project Not Found</h2>
        <p className="text-xs text-stone-500">The project listing you requested does not exist or has been removed.</p>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!currentUser) {
      setApplyError('Please log in or create a student account to apply to projects.');
      return;
    }

    if (currentUser.role !== 'student') {
      setApplyError('Only students can apply to projects. Please switch to or register a student account.');
      return;
    }

    setIsSubmitting(true);
    setApplyError(null);

    try {
      await applyToProject(project.id, pitchNote);
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setIsApplyModalOpen(false);
        setPitchNote('');
        setIsSubmitting(false);
      }, 1500);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Failed to submit application. Please try again.';
      setApplyError(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link
        href="/projects"
        className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-[#0D3D2B] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to all projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Project Details (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getCategoryBadgeClass(project.category)}`}>
                {formatCategoryName(project.category)}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={project.status === 'open' ? 'yellow' : 'primary'} size="sm">
                  {project.status === 'open' ? 'Accepting Applications' : project.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-stone-400 font-medium">Posted {formatDate(project.created_at)}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111C16] leading-tight">
              {project.title}
            </h1>

            {/* Business Quick Bar */}
            <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {project.business?.logo_url ? (
                  <img
                    src={project.business.logo_url}
                    alt={project.business.business_name}
                    className="w-10 h-10 rounded-2xl object-cover border border-[#E5DFD5]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {project.business?.business_name || 'Small Business Partner'}
                  </h3>
                  <div className="text-xs text-stone-500 flex items-center gap-2 font-medium">
                    <span>{project.business?.industry}</span>
                    {project.business?.location && <span>• {project.business.location}</span>}
                  </div>
                </div>
              </div>

              {project.business?.website_url && (
                <a
                  href={project.business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0D3D2B] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Project Scope & Objectives */}
          <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 mb-2">
                Project Overview & Goal
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line font-medium">
                {project.description}
              </p>
            </div>

            {/* Expected Deliverables */}
            {project.deliverables_description && (
              <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#E5DFD5] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D3D2B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16563D]" />
                  Tangible Deliverables
                </h3>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                  {project.deliverables_description}
                </p>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                Skills & Tools Desired
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.skills_required.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-xl bg-[#F4F0E6] text-[#1E2E25] border border-[#E5DFD5] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar (Right Column) */}
        <div className="space-y-6">
          {/* Apply Box */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-stone-900">Engagement Details</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#E5DFD5]">
                <span className="text-stone-600 flex items-center gap-1.5 font-medium whitespace-nowrap">
                  <Clock className="w-4 h-4 text-[#16563D] shrink-0" />
                  Estimated Time:
                </span>
                <span className="font-bold text-[#0D3D2B] whitespace-nowrap">
                  ~{project.estimated_hours_per_week} hrs/wk
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#E5DFD5]">
                <span className="text-stone-600 flex items-center gap-1.5 font-medium whitespace-nowrap">
                  <Calendar className="w-4 h-4 text-[#16563D] shrink-0" />
                  Duration:
                </span>
                <span className="font-bold text-[#0D3D2B] whitespace-nowrap">
                  {project.duration_weeks} wks
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#E5DFD5]">
                <span className="text-stone-600 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#16563D] shrink-0" />
                  Cost:
                </span>
                <span className="font-extrabold text-[#0D3D2B]">
                  $0 Free (Experience & Portfolio)
                </span>
              </div>
            </div>

            {project.status === 'open' ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setIsApplyModalOpen(true)}
              >
                Apply to this Project
              </Button>
            ) : (
              <div className="p-3 rounded-xl bg-[#FAF3E8] text-[#0D3D2B] text-center text-xs font-bold border border-[#E5DFD5]">
                This project is currently {project.status.replace('_', ' ')}.
              </div>
            )}

            <p className="text-[11px] text-stone-400 text-center leading-normal font-medium">
              Students and businesses enter into a mutual experiential agreement. No payment is exchanged.
            </p>
          </div>

          {/* About the Business Sidebar Box */}
          {project.business && (
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E5DFD5] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D3D2B]">
                About the Business
              </h4>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                {project.business.description || 'Verified local business partnering with StudentConnect to offer real work experiences.'}
              </p>
              <div className="pt-2 text-xs text-stone-600 space-y-1 font-medium">
                <div><strong className="text-[#0D3D2B]">Industry:</strong> {project.business.industry}</div>
                <div><strong className="text-[#0D3D2B]">Location:</strong> {project.business.location}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setApplyError(null);
        }}
        title={`Apply to ${project.title}`}
        description={`Pitch note to ${project.business?.business_name || 'Business'}`}
      >
        {applySuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto border border-[#CDE5D7]">
              <Check className="w-6 h-6 text-[#0D3D2B]" />
            </div>
            <h4 className="font-bold text-lg text-stone-900">Application Submitted!</h4>
            <p className="text-xs text-stone-500">
              The business owner will review your application. You can track status in your Applications tab.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            {applyError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-col gap-2">
                <span>{applyError}</span>
                {!currentUser && (
                  <div className="flex gap-2 pt-1">
                    <Link href="/auth/login?role=student" className="underline font-bold hover:text-red-900">
                      Log In as Student
                    </Link>
                    <span>•</span>
                    <Link href="/auth/register?role=student" className="underline font-bold hover:text-red-900">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your pitch & proposal
              </label>
              <textarea
                rows={5}
                required
                value={pitchNote}
                disabled={isSubmitting}
                onChange={(e) => setPitchNote(e.target.value)}
                placeholder="Explain why you are excited about this project, your relevant coursework or past projects, and what approach you will take..."
                className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B] disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setApplyError(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Pitch'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
