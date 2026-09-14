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
  MessageSquare,
  FileCheck,
  Star,
  Sparkles
} from 'lucide-react';

export default function WorkspacesIndexPage() {
  const { currentUser, currentStudent, currentBusiness, workspaces, feedbackList } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7A1C2E] flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#2A151B]">Login Required</h2>
        <p className="text-xs text-stone-600">Please log in to access your active project collaboration workspaces.</p>
        <Link href="/login">
          <Button variant="primary">Log In</Button>
        </Link>
      </div>
    );
  }

  const isStudent = currentUser.role === 'student';
  const myWorkspaces = workspaces.filter((ws) =>
    isStudent ? ws.student_id === currentUser.id : ws.business_id === currentUser.id
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
      <div className="bg-gradient-to-br from-[#7A1C2E] via-[#5C1523] to-[#2A151B] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-[#E59819]">
            <Layers className="w-3.5 h-3.5" />
            <span>Collaboration Workspace Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isStudent
              ? `Welcome, ${currentStudent?.full_name || 'Student'}`
              : `Welcome, ${currentBusiness?.business_name || 'Business Partner'}`}
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
            Manage your project milestones, chat with partners, exchange deliverable files, and complete endorsements.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#F0E4DC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Active Collaborations</span>
            <Layers className="w-4 h-4 text-[#7A1C2E]" />
          </div>
          <div className="text-2xl font-black text-[#2A151B] mt-2">
            {activeCount}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">In-progress projects</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F0E4DC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Completed Projects</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#2A151B] mt-2">
            {completedCount}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">Deliverables finalized</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F0E4DC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Partner Rating</span>
            <Star className="w-4 h-4 text-[#E59819] fill-[#E59819]" />
          </div>
          <div className="text-2xl font-black text-[#2A151B] mt-2">
            {avgRating ? `${avgRating} / 5.0` : 'New'}
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            {reviewsReceived.length} {reviewsReceived.length === 1 ? 'review' : 'reviews'} received
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-[#F0E4DC] pb-4">
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
                  ? 'bg-[#7A1C2E] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
            const tasks = workspace.tasks || [];
            const completedTasks = tasks.filter((t) => t.is_completed).length;
            const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            const messages = workspace.messages || [];
            const lastMessage = messages[messages.length - 1];

            return (
              <div
                key={workspace.id}
                className="bg-white rounded-3xl p-6 border border-[#F0E4DC] shadow-xs hover:border-[#7A1C2E]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
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
                    <h3 className="text-lg font-bold text-[#2A151B]">
                      {workspace.project?.title || 'Project Workspace'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-semibold mt-1">
                      {isStudent ? (
                        <span className="flex items-center gap-1 text-[#7A1C2E]">
                          <Building className="w-3.5 h-3.5 text-[#E59819]" />
                          Partner: {workspace.business?.business_name} ({workspace.business?.location})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#7A1C2E]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#7A1C2E]" />
                          Student: {workspace.student?.full_name} ({workspace.student?.school})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Milestone Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
                      <span>Milestones Completed: {completedTasks}/{tasks.length}</span>
                      <span className="text-[#7A1C2E]">{progress}%</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#7A1C2E] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Message Preview */}
                  {lastMessage && (
                    <div className="p-3 rounded-2xl bg-[#FFF8F3] border border-[#F0E4DC] text-xs text-stone-600 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#7A1C2E] shrink-0 mt-0.5" />
                      <p className="line-clamp-1">
                        <span className="font-bold text-stone-800">{lastMessage.sender_name}: </span>
                        {lastMessage.content}
                      </p>
                    </div>
                  )}
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
          <div className="bg-white rounded-3xl p-12 border border-[#F0E4DC] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#7A1C2E] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-[#E59819]" />
            </div>
            <h3 className="text-base font-bold text-[#2A151B]">No workspaces found</h3>
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
