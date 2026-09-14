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
  Sparkles,
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

  const projectId = params?.id as string;
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-xs text-slate-500">The project listing you requested does not exist or has been removed.</p>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      applyToProject(project.id, pitchNote);
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setIsApplyModalOpen(false);
        setPitchNote('');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Please login as a student to apply';
      alert(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link
        href="/projects"
        className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to all projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Project Details (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getCategoryBadgeClass(project.category)}`}>
                {formatCategoryName(project.category)}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={project.status === 'open' ? 'success' : 'primary'} size="sm">
                  {project.status === 'open' ? 'Accepting Applications' : project.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-slate-400">Posted {formatDate(project.created_at)}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {project.title}
            </h1>

            {/* Business Quick Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {project.business?.logo_url ? (
                  <img
                    src={project.business.logo_url}
                    alt={project.business.business_name}
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {project.business?.business_name || 'Small Business Partner'}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
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
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Project Scope & Objectives */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Project Overview & Goal
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Expected Deliverables */}
            {project.deliverables_description && (
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Tangible Deliverables
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {project.deliverables_description}
                </p>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Skills & Tools Desired
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.skills_required.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Engagement Details</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Estimated Time:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ~{project.estimated_hours_per_week} hrs/week
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Duration:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {project.duration_weeks} weeks
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Cost:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-500 font-medium">
                This project is currently {project.status.replace('_', ' ')}.
              </div>
            )}

            <p className="text-[11px] text-slate-400 text-center leading-normal">
              Students and businesses enter into a mutual experiential agreement. No payment is exchanged.
            </p>
          </div>

          {/* About the Business Sidebar Box */}
          {project.business && (
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About the Business
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {project.business.description || 'Verified local business partnering with StudentConnect to offer real work experiences.'}
              </p>
              <div className="pt-2 text-xs text-slate-500 space-y-1">
                <div><strong>Team size:</strong> {project.business.business_size} people</div>
                <div><strong>Location:</strong> {project.business.location}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply to ${project.title}`}
        description={`Pitch note to ${project.business?.business_name || 'Business'}`}
      >
        {applySuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Application Submitted!</h4>
            <p className="text-xs text-slate-500">
              The business owner will review your application. You can track status in your Applications tab.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your pitch & proposal
              </label>
              <textarea
                rows={5}
                required
                value={pitchNote}
                onChange={(e) => setPitchNote(e.target.value)}
                placeholder="Explain why you are excited about this project, your relevant coursework or past projects, and what approach you will take..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Pitch
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
