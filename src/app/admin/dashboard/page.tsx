'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Users,
  Building,
  Briefcase,
  Layers,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, profiles, students, businesses, projects, workspaces, reports } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7A1C2E] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#2A151B]">Admin Access Only</h2>
        <p className="text-xs text-stone-600">This area is restricted to platform moderators and administrators.</p>
        <Link href="/login">
          <Button variant="primary">Log In as Admin</Button>
        </Link>
      </div>
    );
  }

  const pendingStudents = profiles.filter((p) => p.role === 'student' && p.status === 'pending_approval');
  const pendingBusinesses = profiles.filter((p) => p.role === 'business' && p.status === 'pending_approval');
  const pendingProjects = projects.filter((p) => p.status === 'pending_approval');
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const approvedStudents = profiles.filter((p) => p.role === 'student' && p.status === 'approved');
  const approvedBusinesses = profiles.filter((p) => p.role === 'business' && p.status === 'approved');
  const completedWorkspaces = workspaces.filter((ws) => ws.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#7A1C2E] via-[#8B1E3F] to-[#58111F] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E59819] text-black text-xs font-black shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span>Platform Governance & Trust</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Admin Moderation & Analytics Hub
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
            Maintain high quality and trust across StudentConnect. Review signups, inspect new project scopes, and resolve disputes.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/admin/approvals">
              <Button size="sm" variant="yellow" className="text-black font-extrabold">
                Open Approval Queue ({pendingStudents.length + pendingBusinesses.length + pendingProjects.length})
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-black" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#58111F] p-6 rounded-3xl border border-[#7A1C2E] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200/80">Approved Students</span>
            <div className="w-8 h-8 rounded-xl bg-[#7A1C2E] flex items-center justify-center text-[#E59819]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {approvedStudents.length}
          </div>
          <span className="text-[11px] text-amber-300 font-medium">
            +{pendingStudents.length} awaiting approval
          </span>
        </div>

        <div className="bg-[#58111F] p-6 rounded-3xl border border-[#7A1C2E] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200/80">Approved Businesses</span>
            <div className="w-8 h-8 rounded-xl bg-[#7A1C2E] flex items-center justify-center text-[#E59819]">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {approvedBusinesses.length}
          </div>
          <span className="text-[11px] text-amber-300 font-medium">
            +{pendingBusinesses.length} awaiting approval
          </span>
        </div>

        <div className="bg-[#58111F] p-6 rounded-3xl border border-[#7A1C2E] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200/80">Total Projects</span>
            <div className="w-8 h-8 rounded-xl bg-[#7A1C2E] flex items-center justify-center text-[#E59819]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {projects.length}
          </div>
          <span className="text-[11px] text-amber-300 font-medium">
            +{pendingProjects.length} pending moderation
          </span>
        </div>

        <div className="bg-[#58111F] p-6 rounded-3xl border border-[#7A1C2E] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200/80">Completed Engagements</span>
            <div className="w-8 h-8 rounded-xl bg-[#7A1C2E] flex items-center justify-center text-[#E59819]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {completedWorkspaces.length}
          </div>
          <span className="text-[11px] text-amber-300 font-medium">Verified deliverables produced</span>
        </div>
      </div>

      {/* Moderation Action Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approvals Action Card */}
        <div className="bg-[#58111F] rounded-3xl p-6 border border-[#7A1C2E] shadow-sm space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#E59819]" />
              Pending Moderation Queues
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#E59819] text-black text-xs font-black shadow-xs">
              {pendingStudents.length + pendingBusinesses.length + pendingProjects.length} Action Items
            </span>
          </div>
          <p className="text-xs text-amber-200/70 font-medium leading-relaxed">
            Quality control queue for new student registrations, small business verification, and project postings.
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#3D0A14] border border-amber-900/40 flex items-center justify-between">
              <span className="text-amber-100 font-semibold">Student Signups</span>
              <span className="font-bold text-[#E59819]">{pendingStudents.length} pending</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#3D0A14] border border-amber-900/40 flex items-center justify-between">
              <span className="text-amber-100 font-semibold">Business Signups</span>
              <span className="font-bold text-[#E59819]">{pendingBusinesses.length} pending</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#3D0A14] border border-amber-900/40 flex items-center justify-between">
              <span className="text-amber-100 font-semibold">Project Postings</span>
              <span className="font-bold text-[#E59819]">{pendingProjects.length} pending</span>
            </div>
          </div>
          <Link href="/admin/approvals" className="block pt-2">
            <Button size="sm" variant="yellow" className="w-full text-black font-extrabold">
              Review Approval Queues
            </Button>
          </Link>
        </div>

        {/* Safety & Reports Card */}
        <div className="bg-[#58111F] rounded-3xl p-6 border border-[#7A1C2E] shadow-sm space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Trust & Safety Reports
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#E59819] text-black text-xs font-black shadow-xs">
              {pendingReports.length} Open
            </span>
          </div>
          <p className="text-xs text-amber-200/70 font-medium leading-relaxed">
            Flagged messages from project workspaces and dispute requests requiring moderator intervention.
          </p>
          <div className="space-y-2 text-xs">
            {reports.slice(0, 2).map((rep) => (
              <div key={rep.id} className="p-3.5 rounded-2xl bg-[#3D0A14] border border-amber-900/40 space-y-1">
                <div className="font-semibold text-amber-200">
                  {rep.reason}
                </div>
                <div className="text-[10px] text-amber-300/80 font-medium">
                  Status: {rep.status}
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/reports" className="block pt-2">
            <Button size="sm" variant="yellow" className="w-full text-black font-extrabold">
              Inspect Reports Queue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
