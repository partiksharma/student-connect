'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getCategoryBadgeClass, formatCategoryName } from '@/lib/utils';
import {
  Building,
  PlusCircle,
  Users,
  Search,
  ArrowRight,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function BusinessProjectsPage() {
  const { currentUser, currentBusiness, projects, applications, workspaces } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#111C16]">Business Login Required</h2>
        <p className="text-xs text-stone-600">Please log in with your business account to manage your projects.</p>
        <Link href="/login">
          <Button variant="primary">Log In</Button>
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
        <p className="text-xs text-stone-600">You are logged in as a Student. Explore open projects available for application.</p>
        <Link href="/projects">
          <Button variant="primary">Browse Open Projects</Button>
        </Link>
      </div>
    );
  }

  // Filter projects belonging to current business
  const myProjects = projects.filter((p) => p.business_id === currentUser.id);

  const filteredProjects = myProjects.filter((p) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : p.status === statusFilter;

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending_approval':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D3D2B] mb-1">
            <Building className="w-4 h-4 text-[#16563D]" />
            <span>{currentBusiness?.business_name || 'Business'} Project Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111C16]">
            Manage Your Project Needs
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Track student applicants, update project statuses, and collaborate in active project workspaces.
          </p>
        </div>

        <Link href="/business/projects/new">
          <Button variant="primary" size="md">
            <PlusCircle className="w-4 h-4 mr-2 text-emerald-200" />
            Post New Project
          </Button>
        </Link>
      </div>

      {/* Controls: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-3xl p-4 border border-[#E5DFD5] shadow-xs">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, skill, or keyword..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF7F2] text-stone-900 outline-none focus:ring-2 focus:ring-[#0D3D2B]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'pending_approval', label: 'Pending Approval' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#0D3D2B] text-white shadow-xs'
                  : 'bg-[#EFE9DE] text-stone-700 hover:bg-[#E5DFD5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const projectApps = applications.filter((a) => a.project_id === project.id);
            const pendingAppsCount = projectApps.filter((a) => a.status === 'pending').length;
            const workspace = workspaces.find((w) => w.project_id === project.id);

            return (
              <div
                key={project.id}
                className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs hover:border-[#0D3D2B]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getCategoryBadgeClass(project.category)}`}>
                      {formatCategoryName(project.category)}
                    </span>
                    <Badge variant={getStatusBadgeVariant(project.status)} size="sm">
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-stone-400 font-medium">
                      Posted {formatDate(project.created_at)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#111C16]">
                      {project.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Skills & Time Commitment */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#16563D]" />
                      {project.estimated_hours_per_week} hrs/week • {project.duration_weeks} weeks
                    </span>
                    <span>•</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {(project.skills_required || []).slice(0, 3).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#F4F0E6] text-[#2D3F33] text-[10px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                      {(project.skills_required || []).length > 3 && (
                        <span className="text-[10px] text-stone-400 font-bold">
                          +{(project.skills_required || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions & Applicant links */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100">
                  <Link href={`/business/projects/${project.id}/applicants`}>
                    <Button
                      size="sm"
                      variant={pendingAppsCount > 0 ? 'primary' : 'outline'}
                      className="relative"
                    >
                      <Users className="w-4 h-4 mr-1.5" />
                      Applicants ({projectApps.length})
                      {pendingAppsCount > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#16563D] text-white text-[10px] font-black">
                          {pendingAppsCount} new
                        </span>
                      )}
                    </Button>
                  </Link>

                  {workspace ? (
                    <Link href={`/workspace/${workspace.id}`}>
                      <Button size="sm" variant="secondary">
                        <Layers className="w-4 h-4 mr-1.5" />
                        Workspace
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm" variant="ghost">
                        View Public Page
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-[#E5DFD5] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F3EC] text-[#0D3D2B] flex items-center justify-center mx-auto">
              <Building className="w-6 h-6 text-[#0D3D2B]" />
            </div>
            <h3 className="text-base font-bold text-[#111C16]">No projects found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {statusFilter !== 'all' || searchQuery
                ? 'Try adjusting your search query or status filter.'
                : 'You have not posted any project needs yet. Create your first project need to start receiving student applications.'}
            </p>
            <Link href="/business/projects/new">
              <Button size="sm" variant="primary">
                <PlusCircle className="w-4 h-4 mr-1.5 text-emerald-200" />
                Post Project Need
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
