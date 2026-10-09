'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatCategoryName } from '@/lib/utils';
import {
  Building,
  PlusCircle,
  Users,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
  GraduationCap,
  Star,
  Award,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function BusinessDashboardPage() {
  const { currentUser, currentBusiness, projects, applications, workspaces, feedbackList, submitFeedback, deleteProject } = useApp();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedWorkspaceForReview, setSelectedWorkspaceForReview] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTestimonial, setReviewTestimonial] = useState('');
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Business Login Required</h2>
        <p className="text-xs text-stone-600">Please log in with your client business account to access your business hub.</p>
        <Link href="/login">
          <Button variant="primary">Log In as Client</Button>
        </Link>
      </div>
    );
  }

  if (currentUser.role !== 'business') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Student Account Detected</h2>
        <p className="text-xs text-stone-600">You are logged in as a Student. Please visit your student workspace.</p>
        <Link href="/student/dashboard">
          <Button variant="primary">Open Student Workspace</Button>
        </Link>
      </div>
    );
  }

  const myProjects = projects.filter((p) => p.business_id === currentUser?.id);
  const myWorkspaces = workspaces.filter((ws) => ws.business_id === currentUser?.id);
  const activeWorkspaces = myWorkspaces.filter((ws) => ws.status !== 'completed');
  const completedWorkspaces = myWorkspaces.filter((ws) => ws.status === 'completed');

  const handleOpenReview = (ws: any) => {
    setSelectedWorkspaceForReview(ws);
    setReviewRating(5);
    setReviewTestimonial('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceForReview) return;

    submitFeedback(
      selectedWorkspaceForReview.project_id,
      selectedWorkspaceForReview.student_id,
      reviewRating,
      reviewTestimonial
    );

    setReviewSubmittedSuccess(true);
    setTimeout(() => {
      setReviewSubmittedSuccess(false);
      setReviewModalOpen(false);
      setSelectedWorkspaceForReview(null);
    }, 1500);
  };

  // Find all pending applications across this business's projects
  const myProjectIds = myProjects.map((p) => p.id);
  const pendingApplicants = applications.filter(
    (a) => myProjectIds.includes(a.project_id) && a.status === 'pending'
  );
  const allMyApplications = applications.filter(
    (a) => myProjectIds.includes(a.project_id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Account Verification Status Banners */}
      {currentUser.status === 'pending_approval' && (
        <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-800">
                <span>Account Verification Pending</span>
              </div>
              <h3 className="font-extrabold text-base text-stone-900">
                Your business organization is currently awaiting administrator verification
              </h3>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                Our team reviews small business accounts to ensure authenticity and maintain safety for our student network. You will be notified once approved!
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold shrink-0 text-center">
            Pending Moderation
          </span>
        </div>
      )}

      {currentUser.status === 'rejected' && (
        <div className="bg-rose-50 border-2 border-rose-300 p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-rose-800">
                <span>Account Status: Rejected</span>
              </div>
              <h3 className="font-extrabold text-base text-stone-900">
                Your business account was rejected during administrator review
              </h3>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                Posting projects and accessing student profiles are restricted. Please contact our support team for more details.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-rose-200 text-rose-900 text-xs font-bold shrink-0 text-center">
            Access Restricted
          </span>
        </div>
      )}

      {/* Business Welcome Banner */}
      <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E5DFD5] shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3EC] border border-[#CDE5D7] text-xs font-bold text-[#0D3D2B]">
            <Building className="w-3.5 h-3.5 text-[#0D3D2B]" />
            <span>Business Portal • {currentBusiness?.business_name || 'Small Business'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111C16]">
            Manage Projects & Student Collaborations
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            Post project needs, review motivated student applicants, and collaborate seamlessly in shared project workspaces.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/business/projects/new">
              <Button size="sm" variant="primary">
                <PlusCircle className="w-4 h-4 mr-1.5 text-emerald-200" />
                Post a Project Need
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Postings</span>
            <div className="p-2 rounded-xl bg-[#E6F3EC] text-[#0D3D2B]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#111C16] mt-2">
            {myProjects.length}
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            {myProjects.filter((p) => p.status === 'open').length} open for applications
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pending Applicants</span>
            <div className="p-2 rounded-xl bg-[#E6F3EC] text-[#0D3D2B]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0D3D2B] mt-2">
            {pendingApplicants.length}
          </div>
          <span className="text-[11px] text-stone-500 font-medium">Awaiting your selection</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Workspaces</span>
            <div className="p-2 rounded-xl bg-[#E6F3EC] text-[#0D3D2B]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#111C16] mt-2">
            {activeWorkspaces.length}
          </div>
          <span className="text-[11px] text-stone-500 font-medium">Live project collaborations</span>
        </div>

        <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E5DFD5] shadow-xs text-[#111C16]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#0D3D2B]">Platform Cost</span>
            <div className="p-2 rounded-xl bg-[#E6F3EC] text-[#0D3D2B]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0D3D2B] mt-2">
            $0 / mo
          </div>
          <span className="text-[11px] text-[#0D3D2B] font-bold">100% Free Forever</span>
        </div>
      </div>

      {/* Projects List with Applicant Counters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#111C16]">
              Your Project Postings
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              Manage your listings, review incoming student applications, or check progress.
            </p>
          </div>
          <Link href="/business/projects/new">
            <Button size="sm" variant="primary">
              <PlusCircle className="w-4 h-4 mr-1.5 text-emerald-200" />
              New Project
            </Button>
          </Link>
        </div>

        {myProjects.length > 0 ? (
          <div className="space-y-4">
            {myProjects.map((proj) => {
              const projApps = applications.filter((a) => a.project_id === proj.id);
              const pendingCount = projApps.filter((a) => a.status === 'pending').length;
              const ws = workspaces.find((w) => w.project_id === proj.id);

              return (
                <div
                  key={proj.id}
                  className="bg-white text-[#111C16] rounded-3xl p-6 border border-[#E5DFD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#0D3D2B]/40 transition-colors"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#FAF7F2] text-[#0D3D2B] border border-[#E5DFD5]">
                        {formatCategoryName(proj.category)}
                      </span>
                      <Badge
                        variant={
                          proj.status === 'open'
                            ? 'warning'
                            : proj.status === 'pending_approval'
                            ? 'warning'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {proj.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-stone-400 font-medium">Posted {formatDate(proj.created_at)}</span>
                    </div>

                    <h3 className="font-extrabold text-lg text-[#111C16]">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 font-medium">{proj.description}</p>
                  </div>

                  {/* Actions & Applicant links */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <Link href={`/business/projects/${proj.id}/applicants`}>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="relative font-bold"
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        Applicants ({projApps.length})
                        {pendingCount > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-[#0D3D2B] text-white font-black">
                            {pendingCount} new
                          </span>
                        )}
                      </Button>
                    </Link>

                    {ws && (
                      <Link href={`/workspace/${ws.id}`}>
                        <Button size="sm" variant="primary">
                          Workspace
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                      onClick={() => {
                        setDeleteError('');
                        setProjectToDelete(proj);
                      }}
                      title="Delete this project"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white text-[#111C16] rounded-3xl p-10 border border-[#E5DFD5] text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] text-[#0D3D2B] flex items-center justify-center mx-auto border border-[#E5DFD5]">
              <Building className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-[#111C16]">No projects posted yet</h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
              Create your first project need to start receiving applications from university students.
            </p>
            <Link href="/business/projects/new">
              <Button size="md" variant="primary" className="px-6 py-2.5">
                Post Project Now
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Completed Collaborations & Leave Review Section */}
      {completedWorkspaces.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#E5DFD5]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#0D3D2B] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0D3D2B]" />
                Completed Projects & Student Reviews
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Give feedback and ratings to students who completed your project deliverables.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#E6F3EC] text-[#0D3D2B] font-bold text-xs">
              {completedWorkspaces.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedWorkspaces.map((ws) => {
              const student = ws.student;
              const hasReview = feedbackList.some(
                (f) => f.project_id === ws.project_id && f.recipient_id === ws.student_id && f.author_id === currentUser?.id
              );
              const reviewGiven = feedbackList.find(
                (f) => f.project_id === ws.project_id && f.recipient_id === ws.student_id && f.author_id === currentUser?.id
              );

              return (
                <div
                  key={ws.id}
                  className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs space-y-4 hover:border-[#0D3D2B]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0D3D2B] text-white font-bold text-sm flex items-center justify-center">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-stone-900">
                          {student?.full_name || 'Student Partner'}
                        </div>
                        <div className="text-xs text-stone-500 font-medium">
                          {ws.project?.title || 'Project'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>

                  {hasReview && reviewGiven ? (
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs space-y-1">
                      <div className="flex items-center gap-1 text-[#C89238] font-black">
                        {[...Array(reviewGiven.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#C89238]" />
                        ))}
                        <span className="ml-1 text-stone-700 font-bold">Review Submitted</span>
                      </div>
                      <p className="text-stone-700 italic font-medium">
                        &quot;{reviewGiven.testimonial}&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-between gap-2">
                      <div className="text-xs text-stone-700 font-medium">
                        Project finished! Student is awaiting your reference review.
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenReview(ws)}
                        className="shrink-0 text-xs py-1.5 font-bold"
                      >
                        <Star className="w-3.5 h-3.5 mr-1 fill-white text-white" />
                        Give Review
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <Link
                      href={`/p/${ws.student_id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-bold text-[#0D3D2B] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Student Profile
                    </Link>
                    <Link
                      href={`/workspace/${ws.id}`}
                      className="text-stone-500 hover:text-stone-900 font-bold"
                    >
                      Workspace Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incoming Student Applications Section */}
      <div className="space-y-4 pt-6 border-t border-[#E5DFD5]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0D3D2B]">
              Incoming Student Applications
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              Review pitches and portfolios from students who applied to your projects.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E6F3EC] text-[#0D3D2B] font-bold text-xs">
            {allMyApplications.length} Total Applicants
          </span>
        </div>

        {allMyApplications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allMyApplications.map((app) => {
              const proj = projects.find((p) => p.id === app.project_id);
              const student = app.student;

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs space-y-4 hover:border-[#0D3D2B]/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#0D3D2B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-stone-900">
                          {student?.full_name || 'Student Applicant'}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {student?.school || 'University Student'} • {formatDate(app.created_at)}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {app.status === 'accepted' ? 'Accepted & Matched' : app.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-stone-700 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5DFD5] italic font-medium leading-relaxed">
                    &ldquo;{app.pitch_note}&rdquo;
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/p/${app.student_id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0D3D2B] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Student Profile
                      </Link>
                    </div>
                    <Link href={`/business/projects/${app.project_id}/applicants`}>
                      <Button size="sm" variant="secondary" className="text-xs py-1.5 px-3">
                        Review & Respond
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-[#E5DFD5] text-center space-y-2">
            <Users className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="text-sm font-bold text-stone-800">No applications received yet</h4>
            <p className="text-xs text-stone-500">
              When students apply to your listed projects, their details and proposals will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Leave Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Leave Review for Student"
        description={`Submit verified feedback for ${selectedWorkspaceForReview?.student?.full_name || 'the student'} to showcase on their public portfolio.`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-5">
          {reviewSubmittedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Review successfully submitted to student portfolio!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-2">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? 'text-[#C89238] fill-[#C89238]'
                        : 'text-stone-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Client Testimonial & Recommendation
            </label>
            <textarea
              rows={4}
              required
              value={reviewTestimonial}
              onChange={(e) => setReviewTestimonial(e.target.value)}
              placeholder="Describe the quality of work, turnaround time, communication, and overall experience..."
              className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => {
          if (!isDeleting) setProjectToDelete(null);
        }}
        title="Delete Project Listing"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold">
                Are you sure you want to delete this project?
              </p>
              <p className="text-rose-700 leading-relaxed font-medium">
                &ldquo;{projectToDelete?.title}&rdquo; will be removed from active marketplace listings. Any active workspaces and applicant conversation records will remain securely archived and accessible.
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => setProjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white border-transparent hover:text-white"
            >
              {isDeleting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Project
                </span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
