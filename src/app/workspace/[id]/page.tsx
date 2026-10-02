'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatTimeAgo } from '@/lib/utils';
import {
  CheckCircle2,
  Star,
  Building,
  GraduationCap,
  ArrowLeft,
  Award,
  ExternalLink,
  Send,
  Flag,
  AlertTriangle,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const {
    workspaces,
    projects,
    students,
    businesses,
    currentUser,
    feedbackList,
    updateWorkspaceStatus,
    sendWorkspaceMessage,
    flagWorkspaceMessage,
    submitFeedback,
  } = useApp();

  const workspaceId = params?.id as string;
  const workspace = workspaces.find((w) => w.id === workspaceId);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Chat state
  const [messageInput, setMessageInput] = useState('');
  const [flagSuccessMsg, setFlagSuccessMsg] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messages = workspace?.messages || [];

  // Smooth local container scroll to bottom without jumping page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!workspace) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Workspace Not Found</h2>
        <p className="text-xs text-stone-500">This workspace does not exist or you do not have permission.</p>
        <Link href="/">
          <Button variant="outline" size="sm">
            Go to Home
          </Button>
        </Link>
      </div>
    );
  }

  const proj = projects.find((p) => p.id === workspace.project_id) || workspace.project;
  const stu = students.find((s) => s.user_id === workspace.student_id) || workspace.student;
  const biz = businesses.find((b) => b.user_id === workspace.business_id) || workspace.business;

  const isStudent = currentUser?.id === workspace.student_id;
  const isBusiness = currentUser?.id === workspace.business_id || currentUser?.role === 'business';
  const isCompleted = workspace.status === 'completed';

  const clientReview = feedbackList.find(
    (f) => f.project_id === workspace.project_id && f.recipient_id === workspace.student_id
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content) return;
    setMessageInput('');
    sendWorkspaceMessage(workspace.id, content);
    
    // Smooth scroll inside chat container only
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  };

  const handleFlagMessage = (msgId: string) => {
    flagWorkspaceMessage(msgId);
    setFlagSuccessMsg('Message reported to StudentConnect moderation team.');
    setTimeout(() => setFlagSuccessMsg(null), 4000);
  };

  const handleStudentCompleteProject = () => {
    updateWorkspaceStatus(workspace.id, 'completed');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientId = isStudent ? workspace.business_id : workspace.student_id;
    submitFeedback(workspace.project_id, recipientId, feedbackRating, feedbackText);
    updateWorkspaceStatus(workspace.id, 'completed');
    setIsFeedbackModalOpen(false);
    setFeedbackText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Status Progression */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href={isStudent ? '/student/dashboard' : '/business/dashboard'}
            className="inline-flex items-center text-xs font-bold text-stone-500 hover:text-[#0D3D2B] mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111C16]">
            {proj?.title || workspace.project?.title || 'Project Workspace'}
          </h1>
          <div className="text-xs text-stone-500 flex flex-wrap items-center gap-3 mt-1 font-medium">
            <span className="flex items-center gap-1 font-bold text-[#0D3D2B]">
              <Building className="w-3.5 h-3.5 text-[#16563D]" />
              {biz?.business_name || workspace.business?.business_name || 'Client Partner'}
            </span>
            <span>•</span>
            <Link
              href={`/p/${workspace.student_id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3EC] hover:bg-[#D4E8DC] text-[#0D3D2B] border border-[#CDE5D7] font-bold text-xs transition-colors shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#0D3D2B]" />
              <span>{stu?.full_name || workspace.student?.full_name || 'Student Builder'} ({stu?.school || workspace.student?.school || 'University'})</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </Link>
            <span>•</span>
            <Badge
              variant={
                isCompleted
                  ? 'success'
                  : workspace.status === 'under_review'
                  ? 'yellow'
                  : 'primary'
              }
              size="sm"
            >
              {workspace.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Project Handshake & Completion Actions */}
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <Badge variant="success" size="md">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Project Completed
              </Badge>
              {isBusiness && !clientReview && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="font-bold"
                >
                  <Star className="w-4 h-4 mr-1 fill-white text-white" />
                  Leave Student Review
                </Button>
              )}
            </div>
          ) : (
            <>
              {isStudent && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleStudentCompleteProject}
                  className="font-bold shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Complete Project & Hand Off
                </Button>
              )}

              {isBusiness && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsFeedbackModalOpen(true)}
                >
                  <Star className="w-4 h-4 mr-1 fill-white text-white" />
                  Complete & Leave Review
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Flag toast feedback */}
      {flagSuccessMsg && (
        <div className="p-3 bg-[#FAF3E8] border border-[#ECDAB8] rounded-2xl text-xs text-[#8C6420] font-bold flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-[#16563D]" />
          <span>{flagSuccessMsg}</span>
        </div>
      )}

      {/* Completion & Review Notification Banner for Business Client */}
      {isCompleted && isBusiness && !clientReview && (
        <div className="bg-[#FAF7F2] text-[#111C16] p-6 rounded-3xl border border-[#E5DFD5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] font-bold flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-6 h-6 text-[#0D3D2B]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#0D3D2B]">
                <span>Project Work Delivered</span>
              </div>
              <h3 className="font-extrabold text-base text-[#111C16]">
                {workspace.student?.full_name || 'The student'} has completed this project!
              </h3>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                Please provide an official rating and testimonial for their verified public portfolio.
              </p>
            </div>
          </div>
          <Button
            size="md"
            variant="primary"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="shrink-0 shadow-xs"
          >
            <Star className="w-4 h-4 mr-1 fill-white text-white" />
            Leave Student Review
          </Button>
        </div>
      )}

      {clientReview && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-200 bg-emerald-50/50 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>Verified Client Review Submitted</span>
                <div className="flex items-center text-amber-500">
                  {[...Array(clientReview.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-stone-700 italic font-medium mt-0.5">
                &ldquo;{clientReview.testimonial}&rdquo;
              </p>
            </div>
          </div>
          <Link href={`/p/${workspace.student_id}`} target="_blank">
            <Button size="sm" variant="outline" className="text-xs shrink-0 font-bold">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              View on Portfolio
            </Button>
          </Link>
        </div>
      )}

      {/* Main Workspace: Direct Project Chat Section */}
      <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-xs flex flex-col h-[680px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5DFD5] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D3D2B] text-white flex items-center justify-center font-bold shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#111C16] flex items-center gap-2">
                <span>Direct Project Chat</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </h2>
              <p className="text-[11px] text-stone-500">
                {workspace.student?.full_name} & {workspace.business?.business_name}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Moderation Monitored
            </span>
          </div>
        </div>

        {/* Chat Messages List */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF7F2]/50 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-stone-400">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="max-w-xs">
                <p className="font-bold text-stone-700 text-xs">No messages yet</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Start the conversation! Align on project details, share links, and coordinate deliverables.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMyMessage = msg.sender_id === currentUser?.id;
              const isMsgFlagged = msg.is_flagged;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-2 px-1 text-[10px] text-stone-400">
                    <span className="font-bold text-stone-700">
                      {isMyMessage ? 'You' : msg.sender_name || (msg.sender_role === 'business' ? 'Business Partner' : 'Student')}
                    </span>
                    {msg.sender_role && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#EFE9DE] text-[#0D3D2B] uppercase">
                        {msg.sender_role}
                      </span>
                    )}
                    <span>•</span>
                    <span>{formatTimeAgo(msg.created_at)}</span>
                  </div>

                  <div
                    className={`relative group max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                      isMyMessage
                        ? 'bg-[#0D3D2B] text-white rounded-br-xs'
                        : 'bg-white border border-[#E5DFD5] text-stone-800 rounded-bl-xs'
                    }`}
                  >
                    {isMsgFlagged ? (
                      <div className="flex items-center gap-2 text-emerald-200 text-xs italic">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>This message has been flagged for moderation review.</span>
                      </div>
                    ) : (
                      <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {!isMyMessage && !isMsgFlagged && (
                      <button
                        onClick={() => handleFlagMessage(msg.id)}
                        className="absolute -right-7 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-[#0D3D2B]"
                        title="Report message"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[#E5DFD5] bg-white flex items-center gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-xs px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#0D3D2B]/50 focus:border-[#0D3D2B] transition-all"
          />
          <Button
            type="submit"
            disabled={!messageInput.trim()}
            size="sm"
            variant="primary"
            className="rounded-2xl px-5 py-3 h-auto text-xs font-bold shrink-0 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Send
          </Button>
        </form>
      </div>

      {/* Complete & Leave Feedback Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Complete Project & Submit Endorsement"
        description={`Leave a rating and testimonial for ${
          isStudent ? workspace.business?.business_name : workspace.student?.full_name
        }`}
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-2">
              Overall Experience Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= feedbackRating
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
              Public Testimonial / Review
            </label>
            <textarea
              rows={4}
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share specific praise on communication, quality of deliverables, and why other partners should work together..."
              className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFeedbackModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit & Mark Project Complete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
