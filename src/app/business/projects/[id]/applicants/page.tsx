'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Users,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function BusinessApplicantsReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, applications, updateApplicationStatus, workspaces } = useApp();

  const projectId = params?.id as string;
  const project = projects.find((p) => p.id === projectId);
  
  const rawProjectApps = applications.filter((a) => a.project_id === projectId);
  const projectAppsMap = new Map<string, (typeof applications)[0]>();
  rawProjectApps.forEach((a) => {
    const key = a.student_id;
    if (!projectAppsMap.has(key)) {
      projectAppsMap.set(key, a);
    } else {
      const existing = projectAppsMap.get(key)!;
      if (a.status === 'accepted' || (existing.status === 'pending' && a.status !== 'pending')) {
        projectAppsMap.set(key, a);
      }
    }
  });
  const projectApps = Array.from(projectAppsMap.values());

  const [notification, setNotification] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Project Not Found</h2>
        <Link href="/business/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const handleAccept = (appId: string, studentName: string) => {
    updateApplicationStatus(appId, 'accepted');
    setNotification(`Accepted ${studentName}! Workspace created.`);
    setTimeout(() => {
      // Find workspace
      const ws = workspaces.find((w) => w.project_id === projectId);
      if (ws) {
        router.push(`/workspace/${ws.id}`);
      } else {
        router.push('/business/dashboard');
      }
    }, 1500);
  };

  const handleReject = (appId: string) => {
    updateApplicationStatus(appId, 'rejected');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/business/dashboard"
        className="inline-flex items-center text-xs font-bold text-[#0D3D2B] hover:text-[#08281A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Applicant Review
          </Badge>
          <span className="text-xs text-stone-400 font-medium">
            {projectApps.length} student {projectApps.length === 1 ? 'applicant' : 'applicants'}
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#111C16]">
          {project.title}
        </h1>
        <p className="text-xs text-stone-500 font-medium">
          Review student pitch proposals. Accepting a student will instantiate your private collaboration workspace.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Applicants List */}
      <div className="space-y-6">
        {projectApps.length > 0 ? (
          projectApps.map((app) => {
            const student = app.student;
            const isAccepted = app.status === 'accepted';
            const isPending = app.status === 'pending';
            const isRejected = app.status === 'rejected';

            return (
              <div
                key={app.id}
                className={`bg-white rounded-3xl p-8 border transition-all duration-200 space-y-6 ${
                  isAccepted
                    ? 'border-emerald-600/50 shadow-md shadow-emerald-950/5'
                    : 'border-[#E5DFD5]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    {student?.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        alt={student.full_name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#E5DFD5]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center font-bold text-lg">
                        {student?.full_name?.charAt(0) || 'S'}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#111C16]">
                          {student?.full_name || 'Applicant'}
                        </h3>
                        {isAccepted && (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Matched & Accepted
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="danger" size="sm">
                            Declined
                          </Badge>
                        )}
                        {isPending && (
                          <Badge variant="warning" size="sm">
                            Pending Decision
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2 mt-0.5 font-medium">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-[#0D3D2B]" />
                          {student?.school} • Class of {student?.graduation_year}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-[#0D3D2B] shrink-0" />
                          Available ~{student?.availability_hours_per_week} hrs/wk
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* External Links */}
                  <div className="flex items-center gap-2">
                    {student?.user_id && (
                      <Link href={`/p/${student.user_id}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          View Portfolio
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Pitch Note Box */}
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0D3D2B]">
                    Student Proposal / Pitch:
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed font-medium">
                    &ldquo;{app.pitch_note}&rdquo;
                  </p>
                </div>

                {/* Skills Tags */}
                {student?.skills && (
                  <div className="flex flex-wrap gap-1.5">
                    {student.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#F4F0E6] text-[#1E2E25] font-semibold border border-[#E5DFD5]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Decision Actions */}
                {isPending && (
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleReject(app.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAccept(app.id, student?.full_name || 'Student')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Accept & Start Project Workspace
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E5DFD5] space-y-3">
            <Users className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">
              No applicants yet
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              As students discover your posting in the marketplace, their proposals will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
