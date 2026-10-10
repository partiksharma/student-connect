'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  GraduationCap,
  Award,
  ExternalLink,
  Plus,
  X,
  Check,
  Globe,
  Clock,
  BookOpen
} from 'lucide-react';

export default function StudentProfilePage() {
  const { currentStudent, currentUser, feedbackList, updateStudentProfile } = useApp();

  const [fullName, setFullName] = useState(currentStudent?.full_name || '');
  const [school, setSchool] = useState(currentStudent?.school || '');
  const [gradYear, setGradYear] = useState(currentStudent?.graduation_year || 2027);
  const [hours, setHours] = useState(currentStudent?.availability_hours_per_week || 8);
  const [bio, setBio] = useState(currentStudent?.bio || '');
  const [skills, setSkills] = useState<string[]>(currentStudent?.skills || ['Social Media Strategy', 'Canva', 'Content Writing']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(currentStudent?.portfolio_urls?.[0] || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when currentStudent loads
  React.useEffect(() => {
    if (currentStudent) {
      if (currentStudent.full_name) setFullName(currentStudent.full_name);
      if (currentStudent.school) setSchool(currentStudent.school);
      if (currentStudent.graduation_year) setGradYear(currentStudent.graduation_year);
      if (currentStudent.availability_hours_per_week) setHours(currentStudent.availability_hours_per_week);
      if (currentStudent.bio) setBio(currentStudent.bio);
      if (currentStudent.skills?.length) setSkills(currentStudent.skills);
      if (currentStudent.portfolio_urls?.length) setPortfolioUrl(currentStudent.portfolio_urls[0]);
    }
  }, [currentStudent]);

  const studentReviews = feedbackList.filter((f) => f.recipient_id === currentUser?.id);

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStudentProfile({
        full_name: fullName,
        school,
        graduation_year: gradYear,
        availability_hours_per_week: hours,
        bio,
        skills,
        portfolio_urls: portfolioUrl ? [portfolioUrl] : [],
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update student profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Public Preview Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111C16]">
            Student Profile & Portfolio
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Manage your public presentation, skills, and weekly project availability.
          </p>
        </div>

        {currentUser && (
          <Link href={`/p/${currentUser.id}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-1.5" />
              View Public Portfolio
            </Button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-5">
          <h2 className="text-base font-bold text-[#111C16] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#0D3D2B]" />
            Education & Bio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                University / College
              </label>
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Expected Graduation Year
              </label>
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(parseInt(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Available Time (Hours / Week)
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Short Bio & Background
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell small business owners about your major, interests, and what kind of real-world projects you are eager to tackle..."
              className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Portfolio / GitHub / LinkedIn Link
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
          </div>
        </div>

        {/* Skills Tag Editor */}
        <div className="bg-white rounded-3xl p-8 border border-[#E5DFD5] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#111C16] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0D3D2B]" />
            Skills & Competencies
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Add tags for relevant skills (e.g. Next.js, Canva, Local SEO, Content Writing, Figma).
          </p>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4F0E6] text-[#1E2E25] border border-[#E5DFD5] text-xs font-bold shadow-2xs"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 transition-colors"
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
              placeholder="e.g. Instagram Reels, Figma, Python..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-[#E5DFD5] bg-white text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
            />
            <Button type="button" size="sm" variant="primary" onClick={handleAddSkill}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {isSaved && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0D3D2B]">
              <Check className="w-4 h-4" />
              Profile updated successfully!
            </div>
          )}
          <div className="ml-auto">
            <Button type="submit" size="md" variant="primary" isLoading={isSaving}>
              Save Profile
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
