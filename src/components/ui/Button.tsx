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
        'bg-[#0D3D2B] hover:bg-[#08281A] text-white shadow-md shadow-[#0D3D2B]/20 hover:shadow-[#0D3D2B]/30 focus:ring-[#0D3D2B]',
      yellow:
        'bg-[#16563D] hover:bg-[#0F3F2C] text-white shadow-md shadow-emerald-900/20 hover:shadow-emerald-900/30 focus:ring-[#16563D] font-bold',
      secondary:
        'bg-[#E6F3EC] hover:bg-[#D4E8DC] text-[#0D3D2B] border border-[#CDE5D7] focus:ring-[#0D3D2B]',
      outline:
        'border-2 border-[#0D3D2B] hover:bg-[#0D3D2B] hover:text-white text-[#0D3D2B] bg-transparent focus:ring-[#0D3D2B]',
      ghost:
        'hover:bg-[#0D3D2B]/10 text-[#0D3D2B] focus:ring-[#0D3D2B]',
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
