'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCategoryName } from '@/lib/utils';
import {
  ShieldCheck,
  GraduationCap,
  Building,
  Briefcase,
  ArrowLeft,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Sparkles
} from 'lucide-react';

type TabType = 'all_pending' | 'students' | 'businesses' | 'pending_projects' | 'approved_projects' | 'rejected_projects';

function AdminApprovalsContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab') as TabType | null;

  const {
    profiles,
    students,
    businesses,
    projects,
    approveUser,
    rejectUser,
    resetUserToPending,
    approveProject,
    rejectProject,
    refreshData
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('all_pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 2000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => {
      setIsRefreshing(false);
      showNotice('Sync completed: Database records updated.');
    }, 400);
  };

  useEffect(() => {
    if (urlTab && ['all_pending', 'students', 'businesses', 'pending_projects', 'approved_projects', 'rejected_projects'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const q = searchQuery.toLowerCase().trim();

  // Dedicated project lists by exact status
  const pendingProjects = projects.filter((p) =>
    (p.status === 'pending_approval' || (p.status as string) === 'pending') &&
    (!q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.business?.business_name && p.business.business_name.toLowerCase().includes(q)))
  );
  const approvedProjects = projects.filter((p) => 
    (p.status === 'open' || p.status === 'in_progress' || p.status === 'completed') &&
    (!q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  );
  const rejectedProjects = projects.filter((p) => 
    (p.status === 'rejected' || p.status === 'cancelled') &&
    (!q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  );

  // Dedicated user lists
  const studentProfilesList = profiles.filter((p) => {
    if (p.role !== 'student') return false;
    if (!q) return true;
    const st = students.find((s) => s.user_id === p.id);
    return p.email.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || st?.full_name?.toLowerCase().includes(q) || st?.school?.toLowerCase().includes(q);
  });

  const businessProfilesList = profiles.filter((p) => {
    if (p.role !== 'business') return false;
    if (!q) return true;
    const biz = businesses.find((b) => b.user_id === p.id);
    return p.email.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || biz?.business_name?.toLowerCase().includes(q) || biz?.industry?.toLowerCase().includes(q);
  });

  const pendingStudentProfiles = studentProfilesList.filter((p) => p.status === 'pending_approval' || (p.status as string) === 'pending');
  const approvedStudentProfiles = studentProfilesList.filter((p) => p.status === 'approved');

  const pendingBusinessProfiles = businessProfilesList.filter((p) => p.status === 'pending_approval' || (p.status as string) === 'pending');
  const approvedBusinessProfiles = businessProfilesList.filter((p) => p.status === 'approved');

  const totalPendingAll = pendingStudentProfiles.length + pendingBusinessProfiles.length + pendingProjects.length;

  const handleRejectProject = (projectId: string, title: string) => {
    rejectProject(projectId);
    showNotice(`Project "${title}" moved to Rejected Projects section.`);
  };

  const handleApproveProject = (projectId: string, title: string) => {
    approveProject(projectId);
    showNotice(`Project "${title}" approved and published to the marketplace!`);
  };

  const handleRejectUser = (userId: string, email: string) => {
    rejectUser(userId);
    showNotice(`Account "${email}" has been rejected.`);
  };

  const handleApproveUser = (userId: string, email: string) => {
    approveUser(userId);
    showNotice(`Account "${email}" approved successfully! Access granted.`);
  };

  const handleResetUserToPending = (userId: string, email: string) => {
    resetUserToPending(userId);
    showNotice(`Account "${email}" moved back to Pending Approvals queue.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center text-xs font-medium text-stone-400 hover:text-[#34D399] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Admin Hub
      </Link>

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D3D2B] border border-[#16563D] text-xs font-semibold text-[#A7F3D0]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Moderation & Governance Console</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Live Sync</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Platform Review & Approvals Queue
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Review and approve newly created student IDs and client business accounts.
          </p>
        </div>

        {/* Actions: Sync & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-xs font-bold border-[#16563D] bg-[#07261A] text-[#A7F3D0] hover:bg-[#0D3D2B] hover:text-white shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-[#34D399]'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud DB'}</span>
          </Button>

          {/* Search & Filter Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email, name, ID..."
              className="w-full bg-[#07261A] text-xs text-white pl-10 pr-4 py-2.5 rounded-2xl border border-[#16563D] outline-none focus:ring-2 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className="flex border-b border-stone-800 gap-2 sm:gap-6 overflow-x-auto pb-1">
        {/* 0. All Pending (Primary Queue) */}
        <button
          onClick={() => setActiveTab('all_pending')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'all_pending'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>All Pending Approvals</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            totalPendingAll > 0 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-stone-800 text-stone-400'
          }`}>
            {totalPendingAll}
          </span>
        </button>

        {/* 1. Student Accounts */}
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-[#34D399] text-[#34D399]'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Accounts</span>
          {pendingStudentProfiles.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingStudentProfiles.length} Pending
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-black">
              {studentProfilesList.length}
            </span>
          )}
        </button>

        {/* 2. Business Accounts */}
        <button
          onClick={() => setActiveTab('businesses')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'businesses'
              ? 'border-[#34D399] text-[#34D399]'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Client Businesses</span>
          {pendingBusinessProfiles.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingBusinessProfiles.length} Pending
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-black">
              {businessProfilesList.length}
            </span>
          )}
        </button>

        {/* 3. Pending Projects */}
        <button
          onClick={() => setActiveTab('pending_projects')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pending_projects'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Pending Projects</span>
          {pendingProjects.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingProjects.length} Pending
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-black">
              0
            </span>
          )}
        </button>

        {/* 4. Approved Projects */}
        <button
          onClick={() => setActiveTab('approved_projects')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'approved_projects'
              ? 'border-[#34D399] text-[#34D399]'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Approved Projects</span>
          <span className="px-2 py-0.5 rounded-full bg-[#0D3D2B] text-[#A7F3D0] text-[10px] font-black">
            {approvedProjects.length}
          </span>
        </button>

        {/* 5. Rejected Projects */}
        <button
          onClick={() => setActiveTab('rejected_projects')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rejected_projects'
              ? 'border-rose-400 text-rose-400'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>Rejected Projects</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-black">
            {rejectedProjects.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {/* ========================================================================= */}
        {/* SECTION 0: ALL PENDING QUEUE (STUDENTS, CLIENTS & PROJECTS) */}
        {/* ========================================================================= */}
        {activeTab === 'all_pending' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-[#07261A] border border-amber-500/30 p-5 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Unified Platform Approvals Queue ({totalPendingAll} Items Waiting)
                  </h2>
                  <p className="text-[11px] text-stone-300 mt-0.5">
                    Review and authorize newly registered students, client organizations, and project scopes in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                    {pendingStudentProfiles.length} Students
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                    {pendingBusinessProfiles.length} Clients
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                    {pendingProjects.length} Projects
                  </span>
                </div>
              </div>
            </div>

            {totalPendingAll === 0 ? (
              <div className="text-center py-16 bg-[#07261A] rounded-3xl border border-[#16563D] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#34D399] mx-auto" />
                <h3 className="text-sm font-bold text-white">All Caught Up!</h3>
                <p className="text-xs text-[#A7F3D0]/70 max-w-sm mx-auto">
                  There are no IDs or projects currently waiting for verification. All accounts and scopes have been reviewed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Pending Students List */}
                {pendingStudentProfiles.map((p) => {
                  const st = students.find((s) => s.user_id === p.id);
                  const displayName = st?.full_name || p.email.split('@')[0];

                  return (
                    <div
                      key={`all-stu-${p.id}`}
                      className="bg-[#07261A] rounded-3xl p-6 border-2 border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                    >
                      <div className="space-y-2.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            Student Account
                          </span>
                          <Badge variant="warning" size="sm">
                            Pending Verification
                          </Badge>
                          <span className="text-xs text-amber-300 font-bold">
                            {p.email}
                          </span>
                          <span className="text-xs text-[#A7F3D0]/70">
                            • Registered {formatDate(p.created_at)}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                          {displayName}
                        </h3>

                        <div className="text-xs text-[#A7F3D0]/90 flex flex-wrap items-center gap-2 font-medium">
                          <span>🏫 {st?.school || 'University Student'}</span>
                          <span>•</span>
                          <span>🎓 Class of {st?.graduation_year || 2027}</span>
                          <span>•</span>
                          <span>⏱️ {st?.availability_hours_per_week || 8} hrs/week available</span>
                        </div>

                        {st?.skills && st.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {st.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#0D3D2B] text-[#A7F3D0] border border-[#16563D] font-bold"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                          onClick={() => handleRejectUser(p.id, p.email)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="yellow"
                          className="font-extrabold text-xs shadow-md shadow-amber-500/20"
                          onClick={() => handleApproveUser(p.id, p.email)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve Student ID
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Pending Businesses List */}
                {pendingBusinessProfiles.map((p) => {
                  const biz = businesses.find((b) => b.user_id === p.id);
                  const bName = biz?.business_name || p.email.split('@')[0];

                  return (
                    <div
                      key={`all-biz-${p.id}`}
                      className="bg-[#07261A] rounded-3xl p-6 border-2 border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                    >
                      <div className="space-y-2.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            Client Organization
                          </span>
                          <Badge variant="warning" size="sm">
                            Pending Verification
                          </Badge>
                          <span className="text-xs text-amber-300 font-bold">
                            {p.email}
                          </span>
                          <span className="text-xs text-[#A7F3D0]/70">
                            • Registered {formatDate(p.created_at)}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                          {bName}
                        </h3>

                        <div className="text-xs text-[#A7F3D0]/90 flex flex-wrap items-center gap-2 font-medium">
                          <span>Industry: {biz?.industry || 'General'}</span>
                          <span>•</span>
                          <span>Location: {biz?.location || 'Local'}</span>
                          <span>•</span>
                          <span>Size: {biz?.business_size || 'Small'}</span>
                        </div>

                        <p className="text-xs text-emerald-100/90 leading-relaxed bg-[#0D3D2B]/40 p-3 rounded-2xl border border-[#16563D]/60">
                          {biz?.description || 'Registered small business client account.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                          onClick={() => handleRejectUser(p.id, p.email)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="yellow"
                          className="font-extrabold text-xs shadow-md shadow-amber-500/20"
                          onClick={() => handleApproveUser(p.id, p.email)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve Client ID
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* 3. Pending Projects List */}
                {pendingProjects.map((proj) => {
                  const bizName = proj.business?.business_name || (businesses.find((b) => b.user_id === proj.business_id)?.business_name) || 'Client Partner';

                  return (
                    <div
                      key={`all-proj-${proj.id}`}
                      className="bg-[#07261A] rounded-3xl p-6 border-2 border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                    >
                      <div className="space-y-2.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Project Scope Submission
                          </span>
                          <Badge variant="warning" size="sm">
                            Pending Review
                          </Badge>
                          <span className="text-xs text-amber-300 font-bold">
                            Client: {bizName}
                          </span>
                          <span className="text-xs text-[#A7F3D0]/70">
                            • Submitted {formatDate(proj.created_at)}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                          {proj.title}
                        </h3>

                        <div className="text-xs text-[#A7F3D0]/90 flex flex-wrap items-center gap-2 font-medium">
                          <span>Category: {formatCategoryName(proj.category)}</span>
                          <span>•</span>
                          <span>Commitment: {proj.estimated_hours_per_week || 8} hrs/wk</span>
                          <span>•</span>
                          <span>Duration: {proj.duration_weeks || 4} weeks</span>
                        </div>

                        <p className="text-xs text-emerald-100/90 leading-relaxed bg-[#0D3D2B]/40 p-3 rounded-2xl border border-[#16563D]/60">
                          {proj.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                          onClick={() => handleRejectProject(proj.id, proj.title)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="yellow"
                          className="font-extrabold text-xs shadow-md shadow-amber-500/20"
                          onClick={() => handleApproveProject(proj.id, proj.title)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve Project
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: PENDING PROJECTS DEDICATED TAB */}
        {/* ========================================================================= */}
        {activeTab === 'pending_projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
              <div>
                <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  Pending Project Scope Submissions ({pendingProjects.length})
                </h2>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Review new client project scopes before publishing them to the public student marketplace.
                </p>
              </div>
            </div>

            {pendingProjects.length > 0 ? (
              pendingProjects.map((proj) => {
                const bizName = proj.business?.business_name || (businesses.find((b) => b.user_id === proj.business_id)?.business_name) || 'Client Partner';

                return (
                  <div
                    key={proj.id}
                    className="bg-[#07261A] rounded-3xl p-6 border-2 border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                  >
                    <div className="space-y-2.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="warning" size="sm">
                          Pending Approval
                        </Badge>
                        <span className="text-xs text-amber-300 font-bold">
                          Client: {bizName}
                        </span>
                        <span className="text-xs text-[#A7F3D0]/70">
                          • Submitted {formatDate(proj.created_at)}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-xl text-white">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-emerald-100/90 leading-relaxed">{proj.description}</p>
                      <div className="text-xs text-[#A7F3D0]/80 flex flex-wrap items-center gap-4 font-semibold">
                        <span>Category: {formatCategoryName(proj.category)}</span>
                        <span>•</span>
                        <span>Commitment: {proj.estimated_hours_per_week || 8} hrs/wk</span>
                        <span>•</span>
                        <span>Duration: {proj.duration_weeks || 4} weeks</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                        onClick={() => handleRejectProject(proj.id, proj.title)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject Scope
                      </Button>
                      <Button
                        size="sm"
                        variant="yellow"
                        className="font-extrabold text-xs shadow-md shadow-amber-500/20"
                        onClick={() => handleApproveProject(proj.id, proj.title)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve & Publish
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-[#07261A] rounded-3xl border border-[#16563D] text-xs text-[#A7F3D0]/70 font-medium">
                No project submissions currently awaiting moderation.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: APPROVED PROJECTS (LIVE ON MARKETPLACE) */}
        {/* ========================================================================= */}
        {activeTab === 'approved_projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
              <div>
                <h2 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Active Approved Projects ({approvedProjects.length})
                </h2>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  These projects are currently approved, published, and visible on the marketplace for students to browse and apply.
                </p>
              </div>
            </div>

            {approvedProjects.length > 0 ? (
              approvedProjects.map((proj) => {
                const bizName = proj.business?.business_name || (businesses.find((b) => b.user_id === proj.business_id)?.business_name) || 'Client Partner';

                return (
                  <div
                    key={proj.id}
                    className="bg-[#07261A] rounded-3xl p-6 border border-[#16563D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] px-3 py-1 rounded-full font-bold bg-[#0D3D2B] text-[#A7F3D0] border border-[#16563D]">
                          {formatCategoryName(proj.category)}
                        </span>
                        <Badge variant="success" size="sm">
                          Live • {proj.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-[#A7F3D0]/80 font-bold">
                          Client: {bizName}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-lg text-white">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-emerald-100/90 leading-relaxed">{proj.description}</p>
                      <div className="text-xs text-[#A7F3D0]/80 flex flex-wrap items-center gap-4 font-semibold">
                        <span>Commitment: {proj.estimated_hours_per_week || 8} hrs/wk</span>
                        <span>•</span>
                        <span>Duration: {proj.duration_weeks || 4} weeks</span>
                        <span>•</span>
                        <span>Approved {formatDate(proj.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/projects/${proj.id}`} target="_blank">
                        <Button size="sm" variant="ghost" className="text-xs text-[#34D399] font-bold">
                          View Live Listing ↗
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                        onClick={() => handleRejectProject(proj.id, proj.title)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Unpublish / Reject
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-[#07261A] rounded-3xl border border-[#16563D] text-xs text-[#A7F3D0]/70 font-medium">
                No approved projects currently live on the marketplace.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: REJECTED PROJECTS */}
        {/* ========================================================================= */}
        {activeTab === 'rejected_projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
              <div>
                <h2 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-400" />
                  Rejected Projects Submissions ({rejectedProjects.length})
                </h2>
                <p className="text-[11px] text-rose-200/80 mt-0.5">
                  These project submissions were rejected by admin moderation and are hidden from the public website.
                </p>
              </div>
            </div>

            {rejectedProjects.length > 0 ? (
              rejectedProjects.map((proj) => {
                const bizName = proj.business?.business_name || (businesses.find((b) => b.user_id === proj.business_id)?.business_name) || 'Client Partner';

                return (
                  <div
                    key={proj.id}
                    className="bg-[#07261A] rounded-3xl p-6 border border-rose-900/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] px-3 py-1 rounded-full font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {formatCategoryName(proj.category)}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-900/60 text-rose-300 font-bold border border-rose-700">
                          Status: Rejected
                        </span>
                        <span className="text-xs text-rose-200/70 font-bold">
                          Client: {bizName}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-lg text-rose-100">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-stone-400 line-clamp-2">{proj.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="yellow"
                        className="font-bold text-xs"
                        onClick={() => handleApproveProject(proj.id, proj.title)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Restore & Approve
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-[#07261A] rounded-3xl border border-[#16563D] text-xs text-[#A7F3D0]/70 font-medium">
                No rejected projects on record.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: STUDENT ACCOUNTS (PENDING & APPROVED) */}
        {/* ========================================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* 4A. Pending Students */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                <div>
                  <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Student Signups Requiring Verification ({pendingStudentProfiles.length})
                  </h2>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Newly registered students who are pending review. Approving them grants platform access.
                  </p>
                </div>
              </div>

              {pendingStudentProfiles.length > 0 ? (
                pendingStudentProfiles.map((p) => {
                  const st = students.find((s) => s.user_id === p.id);
                  const displayName = st?.full_name || p.email.split('@')[0];

                  return (
                    <div
                      key={p.id}
                      className="bg-[#07261A] rounded-3xl p-6 border-2 border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                    >
                      <div className="space-y-2.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="warning" size="sm">
                            Pending Verification
                          </Badge>
                          <span className="text-xs text-amber-300 font-bold">
                            {p.email}
                          </span>
                          <span className="text-xs text-[#A7F3D0]/70">
                            • Registered {formatDate(p.created_at)}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-amber-400" />
                          {displayName}
                        </h3>

                        <div className="text-xs text-[#A7F3D0]/90 flex flex-wrap items-center gap-2 font-medium">
                          <span>🏫 {st?.school || 'University Student'}</span>
                          <span>•</span>
                          <span>🎓 Class of {st?.graduation_year || 2027}</span>
                          <span>•</span>
                          <span>⏱️ {st?.availability_hours_per_week || 8} hrs/week available</span>
                        </div>

                        {st?.skills && st.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {st.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#0D3D2B] text-[#A7F3D0] border border-[#16563D] font-bold"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-emerald-100/90 leading-relaxed italic bg-[#0D3D2B]/40 p-3 rounded-2xl border border-[#16563D]/60">
                          &ldquo;{st?.bio || 'Enthusiastic university student ready to work on client projects.'}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                          onClick={() => handleRejectUser(p.id, p.email)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="yellow"
                          className="font-extrabold text-xs shadow-md shadow-amber-500/20"
                          onClick={() => handleApproveUser(p.id, p.email)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve Student
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-[#07261A] rounded-3xl border border-[#16563D] text-xs text-[#A7F3D0]/70 font-medium">
                  No student accounts currently waiting for approval. All signups are verified!
                </div>
              )}
            </div>

            {/* 4B. Approved Students */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                <div>
                  <h2 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Verified / Approved Students ({approvedStudentProfiles.length})
                  </h2>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    Students who have been verified and have full platform permissions to browse and apply for projects.
                  </p>
                </div>
              </div>

              {approvedStudentProfiles.length > 0 ? (
                approvedStudentProfiles.map((p) => {
                  const st = students.find((s) => s.user_id === p.id);
                  const displayName = st?.full_name || p.email.split('@')[0];

                  return (
                    <div
                      key={p.id}
                      className="bg-[#07261A] rounded-3xl p-6 border border-[#16563D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="success" size="sm">
                            Approved Student
                          </Badge>
                          <span className="text-xs text-[#A7F3D0]/70">
                            {p.email} • Joined {formatDate(p.created_at)}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-lg text-white">
                          {displayName}
                        </h3>
                        <div className="text-xs text-[#A7F3D0]/80 flex flex-wrap items-center gap-2 font-medium">
                          <span>{st?.school || 'University Student'}</span>
                          <span>•</span>
                          <span>Class of {st?.graduation_year || 2026}</span>
                        </div>
                        <p className="text-xs text-emerald-100/90 leading-relaxed italic">
                          &ldquo;{st?.bio || 'Enthusiastic university student.'}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-amber-300 hover:text-amber-100 hover:bg-amber-900/40 text-xs font-bold"
                          onClick={() => handleResetUserToPending(p.id, p.email)}
                        >
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                          Set to Pending
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                          onClick={() => handleRejectUser(p.id, p.email)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <div className="px-3 py-1.5 rounded-xl bg-[#0D3D2B] border border-[#16563D] text-[#34D399] text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Verified
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-[#07261A] rounded-3xl border border-[#16563D] text-xs text-[#A7F3D0]/70 font-medium">
                  No approved student accounts found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: CLIENT BUSINESS ACCOUNTS (PENDING & APPROVED) */}
        {/* ========================================================================= */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            {/* 5A. Pending Businesses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                <div>
                  <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Business Signups Requiring Verification ({pendingBusinessProfiles.length})
                  </h2>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Newly registered businesses waiting for moderator review before posting projects.
                  </p>
                </div>
              </div>

              {pendingBusinessProfiles.length > 0 ? (
                pendingBusinessProfiles.map((p) => {
                  const biz = businesses.find((b) => b.user_id === p.id);
                  const bName = biz?.business_name || p.email.split('@')[0];

                  return (
                    <div
                      key={p.id}
                      className="bg-[#07261A] rounded-3xl p-6 border-2 border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                    >
                      <div className="space-y-2.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="warning" size="sm">
                            Pending Verification
                          </Badge>
                          <span className="text-xs text-amber-300 font-bold">
                            {p.email}
                          </span>
                          <span className="text-xs text-[#A7F3D0]/70">
                            • Registered {formatDate(p.created_at)}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                          <Building className="w-5 h-5 text-amber-400" />
                          {bName}
                        </h3>

                        <div className="text-xs text-[#A7F3D0]/90 flex flex-wrap items-center gap-2 font-medium">
                          <span>Industry: {biz?.industry || 'General'}</span>
                          <span>•</span>
                          <span>Location: {biz?.location || 'Local'}</span>
                          <span>•</span>
                          <span>Size: {biz?.business_size || 'Small'}</span>
                        </div>

                        <p className="text-xs text-emerald-100/90 leading-relaxed bg-[#0D3D2B]/40 p-3 rounded-2xl border border-[#16563D]/60">
                          {biz?.description || 'Registered small business client account.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                          onClick={() => handleRejectUser(p.id, p.email)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="yellow"
                          className="font-extrabold text-xs shadow-md shadow-amber-500/20"
                          onClick={() => handleApproveUser(p.id, p.email)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve Client
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-[#07261A] rounded-3xl border border-[#16563D] text-xs text-[#A7F3D0]/70 font-medium">
                  No client business accounts currently waiting for approval.
                </div>
              )}
            </div>

            {/* 5B. Approved Businesses */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                <div>
                  <h2 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Verified / Approved Businesses ({approvedBusinessProfiles.length})
                  </h2>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    Businesses authorized to post real projects and hire students.
                  </p>
                </div>
              </div>

              {approvedBusinessProfiles.length > 0 ? (
                approvedBusinessProfiles.map((p) => {
                  const biz = businesses.find((b) => b.user_id === p.id);
                  const bName = biz?.business_name || p.email.split('@')[0];

                  return (
                    <div
                      key={p.id}
                      className="bg-[#07261A] rounded-3xl p-6 border border-[#16563D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="success" size="sm">
                            Approved Business
                          </Badge>
                          <span className="text-xs text-[#A7F3D0]/70">
                            {p.email} • Registered {formatDate(p.created_at)}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-lg text-white">
                          {bName}
                        </h3>
                        <div className="text-xs text-[#A7F3D0]/80 flex flex-wrap items-center gap-2 font-medium">
                          <span>Industry: {biz?.industry || 'General'}</span>
                          <span>•</span>
                          <span>Location: {biz?.location || 'Local'}</span>
                          <span>•</span>
                          <span>Size: {biz?.business_size || 'Small'}</span>
                        </div>
                        <p className="text-xs text-emerald-100/90 leading-relaxed">
                          {biz?.description || 'Registered small business client account.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-amber-300 hover:text-amber-100 hover:bg-amber-900/40 text-xs font-bold"
                          onClick={() => handleResetUserToPending(p.id, p.email)}
                        >
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                          Set to Pending
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40 text-xs font-bold"
                          onClick={() => handleRejectUser(p.id, p.email)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <div className="px-3 py-1.5 rounded-xl bg-[#0D3D2B] border border-[#16563D] text-[#34D399] text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Verified
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-[#07261A] rounded-3xl border border-[#16563D] text-xs text-[#A7F3D0]/70 font-medium">
                  No verified business accounts found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminApprovalsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white text-xs">Loading approvals queue...</div>}>
      <AdminApprovalsContent />
    </Suspense>
  );
}
