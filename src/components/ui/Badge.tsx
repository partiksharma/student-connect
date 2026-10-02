'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'yellow' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full border transition-colors';

  const variants = {
    default: 'bg-[#EFE9DE] text-[#1E2E25] border-[#DDD5C7]',
    primary: 'bg-[#E6F3EC] text-[#0D3D2B] border-[#CDE5D7]',
    yellow: 'bg-[#EFE9DE] text-[#0D3D2B] border-[#DDD5C7]',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-[#FAF3E8] text-[#8C6420] border-[#ECDAB8]',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    outline: 'border-[#0D3D2B]/30 text-[#0D3D2B] bg-transparent',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
