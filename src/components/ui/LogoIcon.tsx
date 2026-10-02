import React from 'react';

interface LogoIconProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: number | string;
  variant?: 'white' | 'dark' | 'auto';
}

export function LogoIcon({
  className = 'w-6 h-6',
  size,
  variant = 'auto',
  style,
  ...props
}: LogoIconProps) {
  // Use white logo on dark surfaces or default to white for the dark brand backgrounds
  const imgSrc = variant === 'dark' ? '/logo.png' : '/logo-white.png';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={size ? { width: size, height: size, ...style } : style}
      {...props}
    >
      <img
        src={imgSrc}
        alt="StudentConnect Logo"
        className="w-full h-full object-contain select-none"
        draggable={false}
      />
    </div>
  );
}

export function LogoWithText({
  className = '',
  iconSize = 'w-10 h-10',
  textColor = 'text-[#111C16]',
}: {
  className?: string;
  iconSize?: string;
  textColor?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSize} rounded-2xl bg-[#0D3D2B] flex items-center justify-center text-white shadow-md shadow-[#0D3D2B]/20 p-2 group-hover:scale-105 transition-transform overflow-hidden`}>
        <LogoIcon className="w-full h-full" variant="white" />
      </div>
      <div>
        <span className={`font-extrabold text-xl tracking-tight ${textColor}`}>
          StudentConnect
        </span>
      </div>
    </div>
  );
}
