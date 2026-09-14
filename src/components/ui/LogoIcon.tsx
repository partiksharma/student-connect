import React from 'react';

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  showShadow?: boolean;
}

export function LogoIcon({ className = 'w-6 h-6', size, showShadow = false, ...props }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {showShadow && (
        <defs>
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1.5" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>
      )}
      <g filter={showShadow ? 'url(#logoShadow)' : undefined}>
        {[0, 72, 144, 216, 288].map((angle, index) => (
          <g key={index} transform={`rotate(${angle} 50 50)`}>
            {/* Person Head Node */}
            <circle cx="50" cy="15" r="5.2" fill="currentColor" />
            {/* Interlocking Body / Arm Flow */}
            <path
              d="M 42 24.5 C 44 21.5 56 21.5 58 24.5 C 64.5 30.5 68 38.5 63.5 48 C 59.5 54 51.5 55.5 44 50.5"
              stroke="currentColor"
              strokeWidth="4.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function LogoWithText({
  className = '',
  iconSize = 'w-10 h-10',
  textColor = 'text-black',
  accentColor = 'text-black'
}: {
  className?: string;
  iconSize?: string;
  textColor?: string;
  accentColor?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSize} rounded-2xl bg-[#7A1C2E] flex items-center justify-center text-white shadow-md shadow-[#7A1C2E]/20 p-2 group-hover:scale-105 transition-transform`}>
        <LogoIcon className="w-full h-full text-white" />
      </div>
      <div>
        <span className={`font-extrabold text-xl tracking-tight ${textColor}`}>
          StudentConnect
        </span>
      </div>
    </div>
  );
}
