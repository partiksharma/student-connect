'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  PlusCircle,
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

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'marketing' | 'web_tech' | 'design' | 'content' | 'operations' | 'research' | 'other'>('marketing');
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [hours, setHours] = useState(4);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [skills, setSkills] = useState<string[]>(['Social Media Strategy', 'Content Writing']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser || currentUser.role !== 'business') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Client Business Access Only</h2>
        <p className="text-xs text-stone-600">Only registered and verified small businesses can post new projects.</p>
        <Link href="/login">
          <Button variant="primary">Log In as Client</Button>
        </Link>
      </div>
    );
  }

  if (currentUser.status === 'pending_approval') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Verification Pending</h2>
        <p className="text-xs text-stone-600">Your client business profile is currently awaiting administrator verification. You will be able to post projects once approved.</p>
        <Link href="/business/dashboard">
          <Button variant="primary">Return to Business Hub</Button>
        </Link>
      </div>
    );
  }

  if (currentUser.status === 'rejected') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Account Rejected</h2>
        <p className="text-xs text-stone-600">Your client organization account was rejected by an administrator. Posting projects is restricted.</p>
        <Link href="/business/dashboard">
          <Button variant="primary">Return to Business Hub</Button>
        </Link>
      </div>
    );
  }

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createProject({
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
        className="inline-flex items-center text-xs font-bold text-[#0D3D2B] hover:text-[#08281A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3EC] border border-[#CDE5D7] text-xs font-bold text-[#0D3D2B] mb-2">
          <PlusCircle className="w-3.5 h-3.5 text-[#0D3D2B]" />
          <span>Small Business Project Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111C16] tracking-tight">
          Post a New Project Need
        </h1>
        <p className="text-xs text-stone-600 font-medium mt-1">
          Describe the problem or backlog item you need help with. Students will review the scope and submit pitches.
        </p>
      </div>

      {/* Scope Guideline Alert */}
      <div className="p-4 rounded-2xl bg-[#0D3D2B] border border-[#07261A] flex items-start gap-3 shadow-md text-white">
        <ShieldAlert className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-100 leading-relaxed">
          <strong className="text-white">Best Practice for Student Work:</strong> Keep weekly commitment between <strong className="text-white">3 to 8 hours/week</strong>. Clearly defined tangible deliverables (e.g. 5 reel drafts, 1 landing page, style guide) yield the highest quality student outcomes.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Core Details */}
        <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30-Day Instagram Growth & Reel Strategy"
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF7F2] text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Project Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B] cursor-pointer"
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
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Estimated Hours / Week
              </label>
              <input
                type="number"
                min={2}
                max={15}
                required
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Target Duration (Weeks)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Project Description & Background
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what your business does and the specific challenge or goal this project addresses..."
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF7F2] text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Key Deliverables (Numbered checklist)
            </label>
            <textarea
              rows={3}
              required
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="1. 30-day content calendar in Canva&#10;2. 5 Reel concept scripts&#10;3. Hashtag strategy cheat sheet"
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FAF7F2] text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
          </div>
        </div>

        {/* Skills Required */}
        <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-[#111C16]">
            Skills or Tools Desired
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F4F0E6] text-[#1E2E25] border border-[#E5DFD5] text-xs font-bold"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-500 transition-colors"
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
              className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 bg-[#FAF7F2] text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleAddSkill}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/business/dashboard">
            <Button type="button" variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="md" variant="primary" isLoading={isSubmitting} className="px-6 py-2.5">
            Submit Project for Approval
          </Button>
        </div>
      </form>
    </div>
  );
}
