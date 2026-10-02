'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  Award
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { currentUser, currentStudent, applications, workspaces, projects } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Student Login Required</h2>
        <p className="text-xs text-stone-600">Please log in with your student account to access your workspace.</p>
        <Link href="/login">
          <Button variant="primary">Log In as Student</Button>
        </Link>
      </div>
    );
  }

  if (currentUser.role !== 'student') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Client Account Detected</h2>
        <p className="text-xs text-stone-600">You are logged in as a Business Client. Please go to your dedicated Business Hub.</p>
        <Link href="/business/dashboard">
          <Button variant="primary">Open Business Dashboard</Button>
        </Link>
      </div>
    );
  }

  const myApplications = applications.filter((a) => a.student_id === currentUser?.id);
  const myWorkspaces = workspaces.filter((ws) => ws.student_id === currentUser?.id);
  const activeWorkspaces = myWorkspaces.filter((ws) => ws.status !== 'completed');
  const completedWorkspaces = myWorkspaces.filter((ws) => ws.status === 'completed');

  const recommendedProjects = projects
    .filter((p) => p.status === 'open' && !myApplications.some((a) => a.project_id === p.id))
    .slice(0, 3);

  const acceptedApplications = myApplications.filter((a) => a.status === 'accepted');
  const studentDisplayName = currentStudent?.full_name || (currentUser?.email ? currentUser.email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Student');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Application Approved Alert Banners */}
      {acceptedApplications.map((app) => {
        const ws = workspaces.find((w) => w.project_id === app.project_id);
        return (
          <div
            key={app.id}
            className="bg-[#FAF7F2] text-[#111C16] p-6 rounded-3xl border border-[#E5DFD5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] font-bold flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-[#0D3D2B]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#0D3D2B]">
                  <span>Application Approved!</span>
                </div>
                <h3 className="font-extrabold text-base text-[#111C16]">
                  The client has accepted your pitch for &ldquo;{app.project?.title || 'Project'}&rdquo;
                </h3>
                <p className="text-xs text-stone-600 font-medium mt-0.5">
                  Business Partner: <strong className="text-[#0D3D2B]">{app.project?.business?.business_name || 'Small Business'}</strong> • Shared collaboration workspace is live!
                </p>
              </div>
            </div>
            {ws && (
              <Link href={`/workspace/${ws.id}`}>
                <Button size="md" variant="primary" className="shrink-0 shadow-xs">
                  Launch Workspace →
                </Button>
              </Link>
            )}
          </div>
        );
      })}

      {/* Welcome Header */}
      <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E5DFD5] shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E6F3EC] border border-[#CDE5D7] text-xs font-bold text-[#0D3D2B]">
            <GraduationCap className="w-3.5 h-3.5 text-[#0D3D2B]" />
            <span>Student Portal • {currentStudent?.school || 'University Student'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111C16]">
            Welcome back, {studentDisplayName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            Track your ongoing small business project engagements, submit deliverables, and build verified references for your portfolio.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/projects">
              <Button size="sm" variant="primary">
                Browse New Projects
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Link href="/student/profile">
              <Button size="sm" variant="outline">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Active Workspaces</span>
            <Layers className="w-4 h-4 text-[#0D3D2B]" />
          </div>
          <div className="text-2xl font-black text-[#111C16] mt-2">
            {activeWorkspaces.length}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">Live project collaborations</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Applications Sent</span>
            <Briefcase className="w-4 h-4 text-[#16563D]" />
          </div>
          <div className="text-2xl font-black text-[#111C16] mt-2">
            {myApplications.length}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            {myApplications.filter((a) => a.status === 'pending').length} awaiting business review
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Completed Projects</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#111C16] mt-2">
            {completedWorkspaces.length}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">Verified portfolio credentials</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Weekly Availability</span>
            <Clock className="w-4 h-4 text-[#16563D]" />
          </div>
          <div className="text-2xl font-black text-[#111C16] mt-2">
            {currentStudent?.availability_hours_per_week || 8} hrs
          </div>
          <span className="text-[11px] text-stone-400 font-medium">Target weekly commitment</span>
        </div>
      </div>

      {/* Active Workspaces Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-[#111C16]">
            Active Project Workspaces
          </h2>
          <p className="text-xs text-stone-500">
            Collaborate directly with your business client partner.
          </p>
        </div>

        {activeWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeWorkspaces.map((ws) => (
              <div
                key={ws.id}
                className="bg-white rounded-3xl p-7 border border-[#E5DFD5] shadow-xs space-y-4 hover:border-[#0D3D2B]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">
                    {ws.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-stone-400 font-semibold">
                    {(ws.messages || []).length} messages
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#111C16]">
                    {ws.project?.title || 'Active Project'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Partner: <strong className="text-[#0D3D2B]">{ws.business?.business_name || 'Small Business'}</strong>
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#E5DFD5]">
                  <div className="flex items-center gap-1.5 text-xs text-[#0D3D2B] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16563D]" />
                    <span>Direct Collaboration</span>
                  </div>
                  <Link href={`/workspace/${ws.id}`}>
                    <Button size="sm" variant="primary">
                      Open Workspace
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] text-center space-y-3">
            <Layers className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No active workspaces</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Once a small business accepts your project application, your shared workspace will appear here.
            </p>
            <Link href="/projects">
              <Button size="sm" variant="primary">
                Find Projects
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Projects */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111C16]">
              Recommended For Your Skills
            </h2>
            <p className="text-xs text-stone-500">
              Open projects matching your profile interests.
            </p>
          </div>
          <Link href="/projects" className="text-xs text-[#0D3D2B] hover:underline font-bold">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
