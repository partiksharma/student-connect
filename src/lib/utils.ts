import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'just now';
  } catch {
    return dateString;
  }
}

export function getCategoryBadgeClass(category: string) {
  switch (category) {
    case 'marketing':
      return 'bg-amber-100/80 text-amber-900 border-amber-300/80';
    case 'web_tech':
      return 'bg-[#7A1C2E]/10 text-[#7A1C2E] border-[#7A1C2E]/20';
    case 'design':
      return 'bg-amber-50 text-[#8B1E3F] border-amber-200';
    case 'content':
      return 'bg-yellow-100/70 text-yellow-900 border-yellow-300/80';
    case 'data_analytics':
      return 'bg-blue-100/70 text-blue-900 border-blue-300/80';
    case 'video_media':
      return 'bg-purple-100/70 text-purple-900 border-purple-300/80';
    case 'social_media':
      return 'bg-rose-100/70 text-rose-900 border-rose-300/80';
    case 'finance':
      return 'bg-emerald-100/70 text-emerald-900 border-emerald-300/80';
    case 'operations':
      return 'bg-stone-100 text-stone-800 border-stone-200';
    case 'research':
      return 'bg-cyan-100/70 text-cyan-900 border-cyan-300/80';
    case 'sales':
      return 'bg-orange-100/70 text-orange-900 border-orange-300/80';
    default:
      return 'bg-amber-50 text-amber-800 border-amber-200';
  }
}

export function formatCategoryName(category: string) {
  switch (category) {
    case 'marketing':
      return 'Marketing & Growth';
    case 'web_tech':
      return 'Web & Tech';
    case 'design':
      return 'UI/UX & Design';
    case 'content':
      return 'Content & Copy';
    case 'data_analytics':
      return 'Data & AI Analytics';
    case 'video_media':
      return 'Video & Media';
    case 'social_media':
      return 'Social Media';
    case 'finance':
      return 'Finance & Accounting';
    case 'operations':
      return 'Operations & Strategy';
    case 'research':
      return 'Market Research';
    case 'sales':
      return 'Sales & Outreach';
    default:
      return category.replace('_', ' ');
  }
}
