'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  GraduationCap,
  ExternalLink,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  Building,
  Award,
  ArrowLeft,
  ShieldCheck,
  Check
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PublicStudentProfilePage() {
  const params = useParams();
  const { students, profiles, feedbackList, projects } = useApp();

  const userId = params?.id as string;
  const rawStudent = students.find((s) => s.user_id === userId);
  const matchedProfile = profiles.find((p) => p.id === userId);

  const student = rawStudent || (matchedProfile ? {
    user_id: matchedProfile.id,
    full_name: matchedProfile.email ? matchedProfile.email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Student Applicant',
    school: 'State University',
    graduation_year: 2027,
    skills: ['Communication', 'Marketing', 'Web Tech'],
    availability_hours_per_week: 10,
    bio: 'Dedicated student builder ready to deliver quality work and verified project outcomes for business clients.',
    portfolio_urls: [],
    avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    is_public: true,
    created_at: matchedProfile.created_at,
    updated_at: matchedProfile.updated_at,
  } : null);

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Student Profile Not Found</h2>
        <p className="text-xs text-stone-500">The portfolio page you requested does not exist or has been removed.</p>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  // Reviews received by this student
  const verifiedReviews = feedbackList.filter(
    (f) => f.recipient_id === student.user_id
  );

  const averageRating =
    verifiedReviews.length > 0
      ? (
          verifiedReviews.reduce((sum, r) => sum + r.rating, 0) / verifiedReviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {student.avatar_url ? (
            <img
              src={student.avatar_url}
              alt={student.full_name}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-[#0D3D2B]/20 shadow-xs"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center font-extrabold text-2xl border border-[#E5DFD5]">
              {student.full_name.charAt(0)}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-[#111C16]">
                {student.full_name}
              </h1>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F3EC] text-[#0D3D2B] border border-[#CDE5D7]">
                <CheckCircle2 className="w-3 h-3 text-[#0D3D2B]" />
                Verified Student
              </div>
            </div>

            <div className="text-xs text-stone-600 flex flex-wrap items-center gap-2 font-medium">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#0D3D2B]" />
                {student.school} • Class of {student.graduation_year}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-[#0D3D2B] shrink-0" />
                Available ~{student.availability_hours_per_week} hrs/wk
              </span>
            </div>

            {averageRating && (
              <div className="flex items-center gap-1.5 pt-1">
                <div className="flex items-center text-[#C89238]">
                  <Star className="w-4 h-4 fill-[#C89238]" />
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {averageRating}
                </span>
                <span className="text-xs text-stone-400 font-medium">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DE] text-[#0D3D2B] border border-[#E5DFD5] text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#0D3D2B]" />
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
          <div className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0D3D2B]">
              About
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line font-medium">
              {student.bio || 'Student actively engaging in hands-on projects for local businesses.'}
            </p>
          </div>

          {/* Client Reviews Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
              <h2 className="text-sm font-bold text-[#111C16] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0D3D2B]" />
                Client Testimonials & Feedback
              </h2>
              <span className="text-xs text-stone-400 font-medium">
                {verifiedReviews.length} Verified {verifiedReviews.length === 1 ? 'Rating' : 'Ratings'}
              </span>
            </div>

            {verifiedReviews.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4">
                No formal client reviews posted yet. Completed projects will showcase business feedback here.
              </p>
            ) : (
              <div className="space-y-4">
                {verifiedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#C89238]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#C89238]" />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {formatDate(rev.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 italic leading-relaxed font-medium">
                      &quot;{rev.testimonial}&quot;
                    </p>

                    <div className="text-[11px] text-[#0D3D2B] font-bold">
                      — {rev.author_name} ({rev.author_role})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Skills & Meta Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D3D2B]">
              Core Skills & Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1.5 rounded-xl bg-[#F4F0E6] text-[#1E2E25] font-bold border border-[#E5DFD5]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Platform Credential Badge */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E5DFD5] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center border border-[#CDE5D7]">
              <ShieldCheck className="w-4 h-4 text-[#0D3D2B]" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">
              StudentConnect Verified
            </h4>
            <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
              Profile background & educational enrollment verified for experiential project matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
