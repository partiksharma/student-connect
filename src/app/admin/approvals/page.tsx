'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getCategoryBadgeClass, formatCategoryName } from '@/lib/utils';
import {
  ShieldCheck,
  GraduationCap,
  Building,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';

export default function AdminApprovalsPage() {
  const {
    profiles,
    students,
    businesses,
    projects,
    approveUser,
    rejectUser,
    approveProject,
    rejectProject
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'businesses' | 'projects'>('students');

  // Filter items in pending status
  const pendingStudentProfiles = profiles.filter(
    (p) => p.role === 'student' && p.status === 'pending_approval'
  );
  const pendingBusinessProfiles = profiles.filter(
    (p) => p.role === 'business' && p.status === 'pending_approval'
  );
  const pendingProjects = projects.filter((p) => p.status === 'pending_approval');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Admin Hub
      </Link>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Moderation</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Platform Approval Queues
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review pending signups and project postings before they become visible to the community.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Students ({pendingStudentProfiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('businesses')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'businesses'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Businesses ({pendingBusinessProfiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Project Postings ({pendingProjects.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {/* Student Queue */}
        {activeTab === 'students' && (
          <>
            {pendingStudentProfiles.length > 0 ? (
              pendingStudentProfiles.map((p) => {
                const st = students.find((s) => s.user_id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-[#58111F] rounded-3xl p-6 border border-[#7A1C2E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#E59819] text-black text-xs font-black shadow-xs">
                          Pending Approval
                        </span>
                        <span className="text-xs text-amber-200/70">
                          Joined {formatDate(p.created_at)}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-lg text-white">
                        {st?.full_name || p.email}
                      </h3>
                      <div className="text-xs text-amber-200/80 flex items-center gap-2 font-medium">
                        <span>{st?.school}</span>
                        <span>•</span>
                        <span>Class of {st?.graduation_year}</span>
                        <span>•</span>
                        <span>~{st?.availability_hours_per_week} hrs/wk</span>
                      </div>
                      <p className="text-xs text-amber-100/90 leading-relaxed italic">
                        &ldquo;{st?.bio}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40"
                        onClick={() => rejectUser(p.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="yellow"
                        className="text-black font-extrabold"
                        onClick={() => approveUser(p.id)}
                      >
                        <Check className="w-4 h-4 mr-1 text-black" />
                        Approve Student
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-[#58111F] rounded-3xl border border-[#7A1C2E] text-xs text-amber-200/70 font-medium">
                No pending student signups.
              </div>
            )}
          </>
        )}

        {/* Business Queue */}
        {activeTab === 'businesses' && (
          <>
            {pendingBusinessProfiles.length > 0 ? (
              pendingBusinessProfiles.map((p) => {
                const biz = businesses.find((b) => b.user_id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-[#58111F] rounded-3xl p-6 border border-[#7A1C2E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#E59819] text-black text-xs font-black shadow-xs">
                          Pending Approval
                        </span>
                        <span className="text-xs text-amber-200/70">
                          Registered {formatDate(p.created_at)}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-lg text-white">
                        {biz?.business_name || p.email}
                      </h3>
                      <div className="text-xs text-amber-200/80 flex items-center gap-2 font-medium">
                        <span>{biz?.industry}</span>
                        <span>•</span>
                        <span>{biz?.location}</span>
                        <span>•</span>
                        <span>Team size: {biz?.business_size}</span>
                      </div>
                      <p className="text-xs text-amber-100/90 leading-relaxed">
                        {biz?.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40"
                        onClick={() => rejectUser(p.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="yellow"
                        className="text-black font-extrabold"
                        onClick={() => approveUser(p.id)}
                      >
                        <Check className="w-4 h-4 mr-1 text-black" />
                        Approve Business
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-[#58111F] rounded-3xl border border-[#7A1C2E] text-xs text-amber-200/70 font-medium">
                No pending business signups.
              </div>
            )}
          </>
        )}

        {/* Project Postings Queue */}
        {activeTab === 'projects' && (
          <>
            {pendingProjects.length > 0 ? (
              pendingProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-[#58111F] rounded-3xl p-6 border border-[#7A1C2E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-3 py-1 rounded-full font-bold bg-[#7A1C2E] text-amber-200 border border-amber-500/30">
                        {formatCategoryName(proj.category)}
                      </span>
                      <span className="text-xs text-amber-200/70 font-medium">
                        {proj.estimated_hours_per_week} hrs/wk • {proj.duration_weeks} wks
                      </span>
                    </div>
                    <h3 className="font-extrabold text-lg text-white">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-amber-100/80 line-clamp-2">{proj.description}</p>
                    {proj.deliverables_description && (
                      <div className="text-[11px] text-amber-200 bg-[#3D0A14] p-3 rounded-xl border border-amber-900/30">
                        <strong className="text-amber-300">Deliverables:</strong> {proj.deliverables_description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40"
                      onClick={() => rejectProject(proj.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject Listing
                    </Button>
                    <Button
                      size="sm"
                      variant="yellow"
                      className="text-black font-extrabold"
                      onClick={() => approveProject(proj.id)}
                    >
                      <Check className="w-4 h-4 mr-1 text-black" />
                      Publish to Marketplace
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-[#58111F] rounded-3xl border border-[#7A1C2E] text-xs text-amber-200/70 font-medium">
                No pending project postings to moderate.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
