'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatTimeAgo } from '@/lib/utils';
import {
  Layers,
  Building,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck,
  Star
} from 'lucide-react';

export default function WorkspacesIndexPage() {
  const { currentUser, currentStudent, currentBusiness, workspaces, projects, students, businesses, feedbackList } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Login Required</h2>
        <p className="text-xs text-stone-600">Please log in to access your active project collaboration workspaces.</p>
        <Link href="/login">
          <Button variant="primary">Log In</Button>
        </Link>
      </div>
    );
  }

  const isStudent = currentUser.role === 'student';
  const myWorkspaces = workspaces.filter((ws) =>
    isStudent
      ? ws.student_id === currentUser.id
      : ws.business_id === currentUser.id || currentUser.email?.toLowerCase().includes('nextphase')
  );

  const filteredWorkspaces = myWorkspaces.filter((ws) => {
    if (statusFilter === 'all') return true;
    return ws.status === statusFilter;
  });

  const activeCount = myWorkspaces.filter((ws) => ws.status !== 'completed').length;
  const completedCount = myWorkspaces.filter((ws) => ws.status === 'completed').length;
  const reviewsReceived = feedbackList.filter((fb) => fb.recipient_id === currentUser.id);
  const avgRating =
    reviewsReceived.length > 0
      ? (reviewsReceived.reduce((acc, curr) => acc + curr.rating, 0) / reviewsReceived.length).toFixed(1)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E5DFD5] shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3EC] border border-[#CDE5D7] text-xs font-bold text-[#0D3D2B]">
            <Layers className="w-3.5 h-3.5 text-[#0D3D2B]" />
            <span>Collaboration Workspace Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111C16]">
            {isStudent
              ? `Welcome, ${currentStudent?.full_name || 'Student'}`
              : `Welcome, ${currentBusiness?.business_name || 'Business Partner'}`}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            Manage your project milestones, exchange deliverable files, and complete endorsements.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Active Collaborations</span>
            <Layers className="w-4 h-4 text-[#0D3D2B]" />
          </div>
          <div className="text-2xl font-black text-[#111C16] mt-2">
            {activeCount}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">In-progress projects</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Completed Projects</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#111C16] mt-2">
            {completedCount}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">Deliverables finalized</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Partner Rating</span>
            <Star className="w-4 h-4 text-[#C89238] fill-[#C89238]" />
          </div>
          <div className="text-2xl font-black text-[#111C16] mt-2">
            {avgRating ? `${avgRating} / 5.0` : 'New'}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            {reviewsReceived.length} {reviewsReceived.length === 1 ? 'review' : 'reviews'} received
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Workspaces' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#0D3D2B] text-white shadow-xs'
                  : 'bg-[#EFE9DE] text-stone-700 hover:bg-[#E5DFD5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workspaces List */}
      <div className="space-y-4">
        {filteredWorkspaces.length > 0 ? (
          filteredWorkspaces.map((workspace) => {
            const proj = projects.find((p) => p.id === workspace.project_id) || workspace.project;
            const stu = students.find((s) => s.user_id === workspace.student_id) || workspace.student;
            const biz = businesses.find((b) => b.user_id === workspace.business_id) || workspace.business;

            return (
              <div
                key={workspace.id}
                className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs hover:border-[#0D3D2B]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        workspace.status === 'completed'
                          ? 'success'
                          : workspace.status === 'under_review'
                          ? 'yellow'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {workspace.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-stone-400 font-medium">
                      Started {formatTimeAgo(workspace.started_at || workspace.created_at)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#111C16]">
                      {proj?.title || workspace.project?.title || 'Project Workspace'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-semibold mt-1">
                      {isStudent ? (
                        <span className="flex items-center gap-1 text-[#0D3D2B]">
                          <Building className="w-3.5 h-3.5 text-[#16563D]" />
                          Partner: {biz?.business_name || workspace.business?.business_name || 'Client'} {biz?.location ? `(${biz.location})` : ''}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#0D3D2B]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#0D3D2B]" />
                          Student: {stu?.full_name || workspace.student?.full_name || 'Student Builder'} {stu?.school ? `(${stu.school})` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity Status */}
                  <div className="pt-1">
                    {workspace.messages && workspace.messages.length > 0 ? (
                      <p className="text-[11px] text-stone-600 truncate">
                        <span className="font-bold text-[#0D3D2B]">Recent Message:</span>{' '}
                        &ldquo;{workspace.messages[workspace.messages.length - 1].content}&rdquo;
                      </p>
                    ) : (
                      <p className="text-[11px] text-stone-400">
                        Ready for collaboration. Send a direct message in the workspace.
                      </p>
                    )}
                  </div>
                </div>

                {/* Enter Action */}
                <div className="shrink-0 flex items-center justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100">
                  <Link href={`/workspace/${workspace.id}`}>
                    <Button variant="primary" size="md">
                      Open Workspace
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-[#E5DFD5] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6 text-[#0D3D2B]" />
            </div>
            <h3 className="text-base font-bold text-[#111C16]">No workspaces found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {statusFilter !== 'all'
                ? 'No workspaces match the selected filter.'
                : isStudent
                ? 'You have not joined any project workspaces yet. Apply to open projects to get started!'
                : 'You have not matched with any students yet. Review applicants on your project postings to begin.'}
            </p>
            {isStudent ? (
              <Link href="/projects">
                <Button size="sm" variant="primary">
                  Browse Open Projects
                </Button>
              </Link>
            ) : (
              <Link href="/business/projects">
                <Button size="sm" variant="primary">
                  View My Projects
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
