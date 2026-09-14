'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#7A1C2E] hover:bg-[#601221] text-white shadow-md shadow-[#7A1C2E]/20 hover:shadow-[#7A1C2E]/30 focus:ring-[#7A1C2E]',
      yellow:
        'bg-[#E59819] hover:bg-[#CF840E] text-slate-950 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 focus:ring-amber-500 font-bold',
      secondary:
        'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#7A1C2E] border border-amber-200 focus:ring-amber-400',
      outline:
        'border-2 border-[#7A1C2E] hover:bg-[#7A1C2E] hover:text-white text-[#7A1C2E] bg-transparent focus:ring-[#7A1C2E]',
      ghost:
        'hover:bg-[#7A1C2E]/10 text-[#7A1C2E] focus:ring-[#7A1C2E]',
      danger:
        'bg-rose-700 hover:bg-rose-800 text-white shadow-sm shadow-rose-700/30 focus:ring-rose-600',
      success:
        'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/30 focus:ring-emerald-600',
    };

    const sizes = {
      sm: 'text-xs px-4 py-2 gap-1.5',
      md: 'text-sm px-6 py-2.5 gap-2',
      lg: 'text-base px-8 py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
