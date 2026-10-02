'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, Check, X, ArrowLeft } from 'lucide-react';

export default function AdminReportsPage() {
  const { reports, resolveReport } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center text-xs font-medium text-stone-400 hover:text-[#34D399] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Admin Hub
      </Link>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-xs font-semibold text-rose-300 mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Trust & Safety Reports</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Flagged Items & Dispute Queue
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Review community reports regarding scope violations, inappropriate messages, or unresponsiveness.
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => {
          const isPending = report.status === 'pending';
          return (
            <div
              key={report.id}
              className="bg-[#07261A] rounded-3xl p-6 border border-[#16563D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black shadow-xs ${isPending ? 'bg-[#16563D] text-white' : 'bg-emerald-600 text-white'}`}>
                    {report.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#A7F3D0]/70 font-medium">
                    Reported {formatDate(report.created_at)}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-white">
                  Report Reason:
                </h3>
                <p className="text-xs text-emerald-100 bg-[#0D3D2B]/60 p-3.5 rounded-2xl border border-[#16563D] leading-relaxed font-medium">
                  {report.reason}
                </p>
              </div>

              {isPending && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/40"
                    onClick={() => resolveReport(report.id, 'dismissed')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="yellow"
                    className="font-extrabold"
                    onClick={() => resolveReport(report.id, 'resolved')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark Resolved
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {reports.length === 0 && (
          <div className="text-center py-12 bg-[#07261A] rounded-3xl border border-[#16563D] text-xs text-[#A7F3D0]/70 font-medium">
            No moderation reports open.
          </div>
        )}
      </div>
    </div>
  );
}
