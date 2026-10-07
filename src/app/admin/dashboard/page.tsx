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
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, profiles, projects, workspaces, reports } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Admin Access Only</h2>
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
      <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E5DFD5] shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E6F3EC] border border-[#CDE5D7] text-[#0D3D2B] text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D3D2B]" />
            <span>Platform Governance & Trust</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111C16]">
            Admin Moderation & Analytics Hub
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            Maintain high quality and trust across StudentConnect. Review signups, inspect new project scopes, and resolve disputes.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/admin/approvals">
              <Button size="sm" variant="yellow" className="font-extrabold">
                Open Approval Queue ({pendingStudents.length + pendingBusinesses.length})
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#07261A] p-6 rounded-3xl border border-[#16563D] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A7F3D0]">Approved Students</span>
            <div className="w-8 h-8 rounded-xl bg-[#0D3D2B] flex items-center justify-center text-[#34D399]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {approvedStudents.length}
          </div>
          <span className="text-[11px] text-[#6EE7B7] font-medium">
            +{pendingStudents.length} awaiting approval
          </span>
        </div>

        <div className="bg-[#07261A] p-6 rounded-3xl border border-[#16563D] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A7F3D0]">Approved Businesses</span>
            <div className="w-8 h-8 rounded-xl bg-[#0D3D2B] flex items-center justify-center text-[#34D399]">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {approvedBusinesses.length}
          </div>
          <span className="text-[11px] text-[#6EE7B7] font-medium">
            +{pendingBusinesses.length} awaiting approval
          </span>
        </div>

        <div className="bg-[#07261A] p-6 rounded-3xl border border-[#16563D] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A7F3D0]">Total Projects</span>
            <div className="w-8 h-8 rounded-xl bg-[#0D3D2B] flex items-center justify-center text-[#34D399]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {projects.length}
          </div>
          <span className="text-[11px] text-[#6EE7B7] font-medium">
            Active on marketplace
          </span>
        </div>

        <div className="bg-[#07261A] p-6 rounded-3xl border border-[#16563D] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A7F3D0]">Completed Engagements</span>
            <div className="w-8 h-8 rounded-xl bg-[#0D3D2B] flex items-center justify-center text-[#34D399]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {completedWorkspaces.length}
          </div>
          <span className="text-[11px] text-[#6EE7B7] font-medium">Verified deliverables produced</span>
        </div>
      </div>

      {/* Moderation Action Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approvals Action Card */}
        <div className="bg-[#07261A] rounded-3xl p-6 border border-[#16563D] shadow-sm space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#34D399]" />
              Pending Moderation Queues
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#16563D] text-white text-xs font-black shadow-xs">
              {pendingStudents.length + pendingBusinesses.length} Action Items
            </span>
          </div>
          <p className="text-xs text-[#A7F3D0]/80 font-medium leading-relaxed">
            Quality control queue for new student registrations and small business verification.
          </p>
          <div className="space-y-2 text-xs">
            <Link
              href="/admin/approvals?tab=students"
              className="p-3.5 rounded-2xl bg-[#0D3D2B]/60 hover:bg-[#0D3D2B] border border-[#16563D] flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#34D399]" />
                <span className="text-emerald-100 font-semibold group-hover:text-white">Student Signups</span>
              </div>
              <span className={`font-bold ${pendingStudents.length > 0 ? 'text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full' : 'text-[#34D399]'}`}>
                {pendingStudents.length} pending →
              </span>
            </Link>

            <Link
              href="/admin/approvals?tab=businesses"
              className="p-3.5 rounded-2xl bg-[#0D3D2B]/60 hover:bg-[#0D3D2B] border border-[#16563D] flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#34D399]" />
                <span className="text-emerald-100 font-semibold group-hover:text-white">Business Signups</span>
              </div>
              <span className={`font-bold ${pendingBusinesses.length > 0 ? 'text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full' : 'text-[#34D399]'}`}>
                {pendingBusinesses.length} pending →
              </span>
            </Link>
          </div>
          <Link href="/admin/approvals" className="block pt-2">
            <Button size="sm" variant="yellow" className="w-full font-extrabold">
              Review Approval Queues
            </Button>
          </Link>
        </div>

        {/* Safety & Reports Card */}
        <div className="bg-[#07261A] rounded-3xl p-6 border border-[#16563D] shadow-sm space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#34D399]" />
              Trust & Safety Reports
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#16563D] text-white text-xs font-black shadow-xs">
              {pendingReports.length} Open
            </span>
          </div>
          <p className="text-xs text-[#A7F3D0]/80 font-medium leading-relaxed">
            Flagged messages from project workspaces and dispute requests requiring moderator intervention.
          </p>
          <div className="space-y-2 text-xs">
            {reports.slice(0, 2).map((rep) => (
              <div key={rep.id} className="p-3.5 rounded-2xl bg-[#0D3D2B]/60 border border-[#16563D] space-y-1">
                <div className="font-semibold text-emerald-100">
                  {rep.reason}
                </div>
                <div className="text-[10px] text-[#A7F3D0] font-medium">
                  Status: {rep.status}
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/reports" className="block pt-2">
            <Button size="sm" variant="yellow" className="w-full font-extrabold">
              Inspect Reports Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Client Business Projects Section */}
      <div className="bg-[#07261A] rounded-3xl p-6 border border-[#16563D] shadow-sm space-y-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#34D399]" />
              Client Projects & Postings List ({projects.length})
            </h3>
            <p className="text-xs text-[#A7F3D0]">
              Live monitor of all projects posted by small businesses on the platform.
            </p>
          </div>
          <Link href="/admin/approvals">
            <Button size="sm" variant="yellow" className="font-extrabold text-xs">
              Open Full Approvals Queue →
            </Button>
          </Link>
        </div>

        <div className="space-y-3 pt-2">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 rounded-2xl bg-[#0D3D2B]/60 border border-[#16563D] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <Badge variant={proj.status === 'open' ? 'success' : 'warning'} size="sm">
                    {proj.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs font-bold text-[#A7F3D0]">
                    Business: {proj.business?.business_name || 'Client Partner'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">{proj.title}</h4>
                <p className="text-xs text-emerald-100/70 line-clamp-1">{proj.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href="/admin/approvals">
                  <Button size="sm" variant="yellow" className="font-bold text-xs py-1.5 px-3">
                    Moderate Listing
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
