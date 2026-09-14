'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getCategoryBadgeClass, formatCategoryName } from '@/lib/utils';
import {
  Building,
  PlusCircle,
  Users,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  FileText,
  GraduationCap
} from 'lucide-react';

export default function BusinessDashboardPage() {
  const { currentUser, currentBusiness, projects, applications, workspaces } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7A1C2E] flex items-center justify-center mx-auto">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#2A151B]">Business Login Required</h2>
        <p className="text-xs text-stone-600">Please log in with your client business account to access your business hub.</p>
        <Link href="/login">
          <Button variant="primary">Log In as Client</Button>
        </Link>
      </div>
    );
  }

  if (currentUser.role !== 'business') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7A1C2E] flex items-center justify-center mx-auto">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#2A151B]">Student Account Detected</h2>
        <p className="text-xs text-stone-600">You are logged in as a Student. Please visit your student workspace.</p>
        <Link href="/student/dashboard">
          <Button variant="primary">Open Student Workspace</Button>
        </Link>
      </div>
    );
  }

  const myProjects = projects.filter((p) => p.business_id === currentUser?.id);
  const myWorkspaces = workspaces.filter((ws) => ws.business_id === currentUser?.id);
  const activeWorkspaces = myWorkspaces.filter((ws) => ws.status !== 'completed');

  // Find all pending applications across this business's projects
  const myProjectIds = myProjects.map((p) => p.id);
  const pendingApplicants = applications.filter(
    (a) => myProjectIds.includes(a.project_id) && a.status === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Business Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-200">
            <Building className="w-3.5 h-3.5" />
            <span>Business Portal • {currentBusiness?.business_name || 'Small Business'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Manage Projects & Student Collaborations
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
            Post project needs, review motivated student applicants, and collaborate seamlessly in shared project workspaces.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/business/projects/new">
              <Button size="sm" variant="success">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Post a Project Need
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Postings</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {myProjects.length}
          </div>
          <span className="text-[11px] text-slate-400">
            {myProjects.filter((p) => p.status === 'open').length} open for applications
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Applicants</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {pendingApplicants.length}
          </div>
          <span className="text-[11px] text-slate-400">Awaiting your selection</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Workspaces</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {activeWorkspaces.length}
          </div>
          <span className="text-[11px] text-slate-400">Live project collaborations</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Platform Cost</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            $0 / mo
          </div>
          <span className="text-[11px] text-slate-400">100% Free Forever</span>
        </div>
      </div>

      {/* Projects List with Applicant Counters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Project Postings
            </h2>
            <p className="text-xs text-slate-500">
              Manage your listings, review incoming student applications, or check progress.
            </p>
          </div>
          <Link href="/business/projects/new">
            <Button size="sm" variant="outline">
              <PlusCircle className="w-4 h-4 mr-1.5 text-emerald-500" />
              New Project
            </Button>
          </Link>
        </div>

        {myProjects.length > 0 ? (
          <div className="space-y-4">
            {myProjects.map((proj) => {
              const projApps = applications.filter((a) => a.project_id === proj.id);
              const pendingCount = projApps.filter((a) => a.status === 'pending').length;
              const ws = workspaces.find((w) => w.project_id === proj.id);

              return (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${getCategoryBadgeClass(proj.category)}`}>
                        {formatCategoryName(proj.category)}
                      </span>
                      <Badge
                        variant={
                          proj.status === 'open'
                            ? 'success'
                            : proj.status === 'pending_approval'
                            ? 'warning'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {proj.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-slate-400">Posted {formatDate(proj.created_at)}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{proj.description}</p>
                  </div>

                  {/* Actions & Applicant links */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* View Applicants Button */}
                    <Link href={`/business/projects/${proj.id}/applicants`}>
                      <Button
                        size="sm"
                        variant={pendingCount > 0 ? 'primary' : 'outline'}
                        className="relative"
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        Applicants ({projApps.length})
                        {pendingCount > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-400 text-slate-950 font-bold">
                            {pendingCount} new
                          </span>
                        )}
                      </Button>
                    </Link>

                    {/* Workspace Jump */}
                    {ws && (
                      <Link href={`/workspace/${ws.id}`}>
                        <Button size="sm" variant="success">
                          Workspace
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Building className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No projects posted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first project need to start receiving applications from university students.
            </p>
            <Link href="/business/projects/new">
              <Button size="sm" variant="success">
                Post Project Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
