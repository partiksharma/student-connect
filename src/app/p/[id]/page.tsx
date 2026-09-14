'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  GraduationCap,
  Sparkles,
  Star,
  CheckCircle2,
  Calendar,
  Building,
  ExternalLink,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export default function PublicStudentPortfolioPage() {
  const params = useParams();
  const { students, feedbackList, projects, workspaces } = useApp();

  const studentId = params?.id as string;
  const student = students.find((s) => s.user_id === studentId);

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Portfolio Not Found</h2>
        <p className="text-xs text-slate-500">This student profile is either private or does not exist.</p>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            Find Projects
          </Button>
        </Link>
      </div>
    );
  }

  // Find verified reviews for this student
  const verifiedReviews = feedbackList.filter(
    (f) => f.recipient_id === student.user_id && f.is_public_on_profile
  );

  // Find completed projects for this student
  const completedProjects = workspaces
    .filter((ws) => ws.student_id === student.user_id && ws.status === 'completed')
    .map((ws) => ws.project)
    .filter(Boolean);

  const averageRating = verifiedReviews.length > 0
    ? (verifiedReviews.reduce((sum, r) => sum + r.rating, 0) / verifiedReviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
        <div className="flex items-center gap-5">
          {student.avatar_url ? (
            <img
              src={student.avatar_url}
              alt={student.full_name}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-indigo-500/20 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-2xl">
              {student.full_name.charAt(0)}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {student.full_name}
              </h1>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Verified Student
              </div>
            </div>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                {student.school} • Class of {student.graduation_year}
              </span>
              <span>•</span>
              <span>Available ~{student.availability_hours_per_week} hrs/wk</span>
            </div>

            {averageRating && (
              <div className="flex items-center gap-1.5 pt-1">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {averageRating}
                </span>
                <span className="text-xs text-slate-400">
                  ({verifiedReviews.length} client {verifiedReviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Links */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {student.portfolio_urls?.map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Link {idx + 1}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Bio & Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Bio Section (2 cols) */}
        <div className="md:col-span-2 space-y-8">
          {/* Bio */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              About
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {student.bio || 'Student actively engaging in hands-on projects for local businesses.'}
            </p>
          </div>

          {/* Verified Client Testimonials */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Verified Small Business Endorsements
            </h2>

            {verifiedReviews.length > 0 ? (
              <div className="space-y-4">
                {verifiedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(rev.created_at)}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      &ldquo;{rev.testimonial}&rdquo;
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {rev.author_name}
                        </span>
                        <span className="text-slate-400 block text-[11px]">
                          {rev.project_title}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No completed project testimonials yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Skills & Meta Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Core Skills & Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Platform Credential Badge */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              StudentConnect Verified
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All project completions and testimonials are verified through platform workspaces with registered small businesses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
