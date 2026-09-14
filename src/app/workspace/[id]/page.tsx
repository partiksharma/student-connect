'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatTimeAgo } from '@/lib/utils';
import {
  CheckCircle2,
  Send,
  Plus,
  Paperclip,
  Flag,
  Star,
  Building,
  GraduationCap,
  Download,
  AlertTriangle,
  ArrowLeft,
  FileCheck
} from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const {
    workspaces,
    currentUser,
    addWorkspaceTask,
    toggleWorkspaceTask,
    sendWorkspaceMessage,
    flagWorkspaceMessage,
    addWorkspaceFile,
    updateWorkspaceStatus,
    submitFeedback,
  } = useApp();

  const workspaceId = params?.id as string;
  const workspace = workspaces.find((w) => w.id === workspaceId);

  const [messageInput, setMessageInput] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [flagSuccessMsg, setFlagSuccessMsg] = useState<string | null>(null);

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

  const tasks = workspace.tasks || [];
  const completedTasksCount = tasks.filter((t) => t.is_completed).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
  const messages = workspace.messages || [];
  const files = workspace.files || [];

  const isStudent = currentUser?.id === workspace.student_id;
  const isCompleted = workspace.status === 'completed';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendWorkspaceMessage(workspace.id, messageInput.trim());
    setMessageInput('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    addWorkspaceTask(workspace.id, taskInput.trim());
    setTaskInput('');
    setIsTaskModalOpen(false);
  };

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addWorkspaceFile(workspace.id, file.name, file.size);
    }
  };

  const handleFlagMessage = (msgId: string) => {
    flagWorkspaceMessage(msgId);
    setFlagSuccessMsg('Message flagged for moderator review.');
    setTimeout(() => setFlagSuccessMsg(null), 3000);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Status Progression */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href={isStudent ? '/student/dashboard' : '/business/dashboard'}
            className="inline-flex items-center text-xs font-bold text-stone-500 hover:text-[#7A1C2E] mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2A151B]">
            {workspace.project?.title || 'Project Workspace'}
          </h1>
          <div className="text-xs text-stone-500 flex flex-wrap items-center gap-3 mt-1 font-medium">
            <span className="flex items-center gap-1 font-bold text-[#7A1C2E]">
              <Building className="w-3.5 h-3.5 text-[#E59819]" />
              {workspace.business?.business_name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-[#7A1C2E]">
              <GraduationCap className="w-3.5 h-3.5 text-[#7A1C2E]" />
              {workspace.student?.full_name} ({workspace.student?.school})
            </span>
          </div>
        </div>

        {/* Project Handshake & Completion Button */}
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <Badge variant="success" size="md">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Engagement Completed
            </Badge>
          ) : (
            <>
              {workspace.status === 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateWorkspaceStatus(workspace.id, 'under_review')}
                >
                  <FileCheck className="w-4 h-4 mr-1 text-[#E59819]" />
                  Submit Deliverables for Review
                </Button>
              )}

              <Button
                size="sm"
                variant="yellow"
                onClick={() => setIsFeedbackModalOpen(true)}
              >
                <Star className="w-4 h-4 mr-1 fill-amber-700 text-amber-700" />
                Complete & Leave Review
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Timeline Header Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0E4DC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-700">
            Milestone Progress:
          </span>
          <div className="w-36 bg-amber-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#7A1C2E] h-3 rounded-full transition-all duration-300"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
          <span className="text-xs font-black text-[#7A1C2E]">
            {taskProgress}% ({completedTasksCount}/{tasks.length})
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-stone-400">Status:</span>
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

      {flagSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-[#E59819] text-[#2A151B] font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <Flag className="w-4 h-4" />
          <span>{flagSuccessMsg}</span>
        </div>
      )}

      {/* Workspace Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tasks Checklist & Deliverables */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tasks & Milestones Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0E4DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#2A151B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A1C2E]" />
                Action Items & Milestones
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="text-xs text-[#7A1C2E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleWorkspaceTask(workspace.id, task.id)}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-colors ${
                    task.is_completed
                      ? 'bg-amber-50/50 border-amber-100 text-stone-400 line-through'
                      : 'bg-[#FFFDF9] border-[#F0E4DC] text-stone-800 hover:border-[#7A1C2E]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => {}}
                    className="rounded text-[#7A1C2E] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs select-none flex-1 font-medium">{task.title}</span>
                </div>
              ))}

              {tasks.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-4">
                  No tasks created yet. Add milestones to track deliverables.
                </p>
              )}
            </div>
          </div>

          {/* Deliverables & Uploaded Files Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0E4DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#2A151B] flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#E59819]" />
                Shared Deliverables & Files
              </h3>
              <label className="text-xs text-[#7A1C2E] hover:underline font-bold flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                Upload File
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUploadMock}
                />
              </label>
            </div>

            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#F0E4DC] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <span className="font-bold text-[#2A151B] block truncate">
                      {file.file_name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {(file.file_size_bytes / (1024 * 1024)).toFixed(2)} MB • {formatTimeAgo(file.created_at)}
                    </span>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${file.file_name}`)}
                    className="p-1.5 rounded-xl text-stone-500 hover:bg-amber-100 transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#7A1C2E]" />
                  </button>
                </div>
              ))}

              {files.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-4">
                  No files uploaded yet. Upload final deliverables, PDFs, or design decks.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real-time In-Platform Messaging */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-[#F0E4DC] shadow-xs flex flex-col h-[650px] overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-[#F0E4DC] flex items-center justify-between bg-[#FFF8F3]">
              <div>
                <h3 className="font-black text-sm text-[#2A151B]">
                  Direct Project Discussion
                </h3>
                <p className="text-[11px] text-stone-400 font-medium">
                  Live in-platform chat between student and business partner.
                </p>
              </div>
              <Badge variant="yellow" size="sm">
                Realtime Active
              </Badge>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FFFDFB]">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-stone-400 font-medium">
                      <span className="font-bold text-stone-700">
                        {msg.sender_name || (isMe ? 'You' : 'Partner')}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(msg.created_at)}</span>
                    </div>

                    <div
                      className={`relative group max-w-[80%] p-4 rounded-3xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-[#7A1C2E] text-white rounded-br-xs shadow-md shadow-[#7A1C2E]/10'
                          : 'bg-[#FFF3E8] text-[#2A151B] border border-amber-200 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}

                      {/* Flag Message */}
                      {!isMe && !msg.is_flagged && (
                        <button
                          onClick={() => handleFlagMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 absolute -right-6 top-2 text-stone-400 hover:text-rose-600 transition-opacity p-1"
                          title="Report inappropriate message"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {msg.is_flagged && (
                        <div className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Flagged for review
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-[#F0E4DC] bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message or project update..."
                className="flex-1 text-xs p-3 rounded-full border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
              />
              <Button type="submit" size="md" variant="primary">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Project Action Item"
        description="Create a milestone or checklist item for this project."
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="e.g. Deliver 5 Instagram reel storyboard hooks"
              className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Task
            </Button>
          </div>
        </form>
      </Modal>

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
                        ? 'text-[#E59819] fill-[#E59819]'
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
              className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
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
