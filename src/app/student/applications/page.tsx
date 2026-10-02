'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, getCategoryBadgeClass, formatCategoryName } from '@/lib/utils';
import {
  Briefcase,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Building,
  ExternalLink
} from 'lucide-react';

export default function StudentApplicationsPage() {
  const { currentUser, applications, workspaces } = useApp();

  const myApplications = applications.filter((a) => a.student_id === currentUser?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111C16]">
          My Applications
        </h1>
        <p className="text-xs text-stone-500 mt-1 font-medium">
          Review all the projects you have applied to, business review statuses, and jump into accepted workspaces.
        </p>
      </div>

      {myApplications.length > 0 ? (
        <div className="space-y-4">
          {myApplications.map((app) => {
            const isAccepted = app.status === 'accepted';
            const isPending = app.status === 'pending';
            const isRejected = app.status === 'rejected';

            // Find corresponding workspace if accepted
            const ws = workspaces.find((w) => w.project_id === app.project_id);

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#0D3D2B]/40 transition-colors"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {app.project?.category && (
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${getCategoryBadgeClass(app.project.category)}`}>
                        {formatCategoryName(app.project.category)}
                      </span>
                    )}

                    {isPending && (
                      <Badge variant="warning" size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Under Review by Business
                      </Badge>
                    )}

                    {isAccepted && (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Accepted & Matched
                      </Badge>
                    )}

                    {isRejected && (
                      <Badge variant="danger" size="sm">
                        <XCircle className="w-3 h-3 mr-1" />
                        Not Selected
                      </Badge>
                    )}

                    <span className="text-xs text-stone-400 font-medium">
                      Applied {formatDate(app.created_at)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#111C16]">
                      {app.project?.title || 'Project Application'}
                    </h3>
                    <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5 font-medium">
                      <Building className="w-3.5 h-3.5 text-[#0D3D2B]" />
                      <span>{app.project?.business?.business_name || 'Small Business Partner'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs text-stone-700">
                    <span className="font-bold text-[#0D3D2B] block mb-1">
                      Your pitch note:
                    </span>
                    <p className="italic">{app.pitch_note}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAccepted && ws && (
                    <Link href={`/workspace/${ws.id}`}>
                      <Button variant="primary" size="md">
                        Open Workspace
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  )}

                  <Link href={`/projects/${app.project_id}`}>
                    <Button variant="outline" size="md">
                      View Project
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E5DFD5] space-y-4">
          <Briefcase className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-[#111C16]">
            No applications submitted yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Browse our project catalog and submit pitch notes to small business postings.
          </p>
          <Link href="/projects">
            <Button size="sm" variant="primary">
              Explore Projects
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
