'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  PlusCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  Plus,
  ShieldAlert
} from 'lucide-react';

export default function NewProjectPostingPage() {
  const router = useRouter();
  const { createProject, currentUser } = useApp();

  if (!currentUser || currentUser.role !== 'business') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7A1C2E] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#2A151B]">Client Business Access Only</h2>
        <p className="text-xs text-stone-600">Only registered and verified small businesses can post new projects.</p>
        <Link href="/login">
          <Button variant="primary">Log In as Client</Button>
        </Link>
      </div>
    );
  }

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'marketing' | 'web_tech' | 'design' | 'content' | 'operations' | 'research' | 'other'>('marketing');
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [hours, setHours] = useState(4);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [skills, setSkills] = useState<string[]>(['Social Media Strategy', 'Content Writing']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      createProject({
        title,
        category,
        description,
        deliverables_description: deliverables,
        skills_required: skills,
        estimated_hours_per_week: hours,
        duration_weeks: durationWeeks,
        perks: ['Certificate of Project Completion', 'Recommendation Testimonial'],
      });

      setTimeout(() => {
        router.push('/business/dashboard');
      }, 1000);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Error creating project';
      alert(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/business/dashboard"
        className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Small Business Project Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Post a New Project Need
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Describe the problem or backlog item you need help with. Students will review the scope and submit pitches.
        </p>
      </div>

      {/* Scope Guideline Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Best Practice for Student Work:</strong> Keep weekly commitment between <strong>3 to 8 hours/week</strong>. Clearly defined tangible deliverables (e.g. 5 reel drafts, 1 landing page, style guide) yield the highest quality student outcomes.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Core Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30-Day Instagram Growth & Reel Strategy"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="marketing">Marketing & Growth</option>
                <option value="web_tech">Web & Software Tech</option>
                <option value="design">UI/UX & Brand Design</option>
                <option value="content">Content & Copywriting</option>
                <option value="data_analytics">Data & AI Analytics</option>
                <option value="video_media">Video Editing & Animation</option>
                <option value="social_media">Social Media & Community</option>
                <option value="finance">Finance & Accounting</option>
                <option value="operations">Operations & Strategy</option>
                <option value="research">Market Research & Insights</option>
                <option value="sales">Sales & Lead Generation</option>
                <option value="other">Other Need</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Hours / Week
              </label>
              <input
                type="number"
                min={2}
                max={15}
                required
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Duration (Weeks)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Description & Background
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what your business does and the specific challenge or goal this project addresses..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Deliverables (Numbered checklist)
            </label>
            <textarea
              rows={3}
              required
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="1. 30-day content calendar in Canva&#10;2. 5 Reel concept scripts&#10;3. Hashtag strategy cheat sheet"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Skills Required */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Skills or Tools Desired
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add skill (e.g. Canva, Next.js, SEO)..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleAddSkill}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/business/dashboard">
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="success" size="md" isLoading={isSubmitting}>
            Submit Project for Approval
          </Button>
        </div>
      </form>
    </div>
  );
}
