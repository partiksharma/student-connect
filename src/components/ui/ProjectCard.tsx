'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types/database';
import { Badge } from './Badge';
import { Button } from './Button';
import { formatCategoryName, getCategoryBadgeClass, formatTimeAgo } from '@/lib/utils';
import { Clock, Calendar, Building, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onApply?: (project: Project) => void;
  showApplyButton?: boolean;
}

export function ProjectCard({ project, onApply, showApplyButton = true }: ProjectCardProps) {
  const isPending = project.status === 'pending_approval';
  const isInProgress = project.status === 'in_progress';
  const isCompleted = project.status === 'completed';

  return (
    <div className="group relative bg-white rounded-3xl border border-[#F0E4DC] hover:border-[#7A1C2E]/40 p-7 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/5 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getCategoryBadgeClass(project.category)}`}>
            {formatCategoryName(project.category)}
          </span>

          <div className="flex items-center gap-2">
            {isPending && (
              <Badge variant="yellow" size="sm">
                Pending Approval
              </Badge>
            )}
            {isInProgress && (
              <Badge variant="primary" size="sm">
                In Progress
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            <span className="text-[11px] font-medium text-stone-400">{formatTimeAgo(project.created_at)}</span>
          </div>
        </div>

        {/* Business Info */}
        <div className="flex items-center gap-2.5 mb-2.5">
          {project.business?.logo_url ? (
            <img
              src={project.business.logo_url}
              alt={project.business.business_name}
              className="w-6 h-6 rounded-full object-cover border border-amber-200"
            />
          ) : (
            <Building className="w-4 h-4 text-[#7A1C2E]" />
          )}
          <span className="text-xs font-bold text-[#7A1C2E]">
            {project.business?.business_name || 'Verified Small Business'}
          </span>
          {project.business?.location && (
            <span className="text-[11px] text-stone-400 font-medium">• {project.business.location}</span>
          )}
        </div>

        {/* Project Title */}
        <Link href={`/projects/${project.id}`} className="block group-hover:text-[#7A1C2E] transition-colors">
          <h3 className="font-extrabold text-base text-[#2A151B] leading-snug mb-2 line-clamp-2">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 mb-4">
          {project.description}
        </p>

        {/* Deliverables snippet */}
        {project.deliverables_description && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FFFDF9] border border-[#F2E7DF] text-[11px] text-stone-700">
            <span className="font-bold text-[#7A1C2E] block mb-1">Key Deliverables:</span>
            <p className="line-clamp-2 whitespace-pre-line">{project.deliverables_description}</p>
          </div>
        )}

        {/* Skills Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.skills_required.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#FAF5F0] text-stone-700 font-semibold border border-amber-100"
            >
              {skill}
            </span>
          ))}
          {project.skills_required.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF5F0] text-stone-400 font-medium">
              +{project.skills_required.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer & Commitment Meta */}
      <div className="pt-4 border-t border-[#F2E7DF] flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>~{project.estimated_hours_per_week} hrs/wk</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>{project.duration_weeks} wks</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showApplyButton && project.status === 'open' && onApply && (
            <Button size="sm" variant="yellow" onClick={() => onApply(project)}>
              Apply Now
            </Button>
          )}

          <Link href={`/projects/${project.id}`}>
            <Button size="sm" variant="outline">
              Details
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
