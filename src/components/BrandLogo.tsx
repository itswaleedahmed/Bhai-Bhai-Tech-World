import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showWordmark?: boolean;
  className?: string;
  subtext?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  showWordmark = true,
  className = '',
  subtext = 'Shop #83, Stadium Park, Sheikhupura',
}) => {
  // Dimension mapping
  const iconDimensions = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Precision Bespoke Vector Insignia */}
      <div className={`relative shrink-0 ${iconDimensions[size]} group`}>
        {/* Ambient Backlight Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#25D366]/30 via-[#00F0FF]/20 to-transparent blur-md group-hover:blur-lg transition-all duration-300 opacity-80" />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Outer Shield Gradient */}
            <linearGradient id="shieldBase" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#181E24" />
              <stop offset="50%" stopColor="#0E1216" />
              <stop offset="100%" stopColor="#07090C" />
            </linearGradient>

            {/* Neon Border Gradient */}
            <linearGradient id="neonBorder" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#25D366" />
              <stop offset="40%" stopColor="#00F5D4" />
              <stop offset="75%" stopColor="#25D366" />
              <stop offset="100%" stopColor="#00C853" />
            </linearGradient>

            {/* Cyber Core Glow */}
            <linearGradient id="cyberCore" x1="25" y1="25" x2="75" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F5D4" />
              <stop offset="50%" stopColor="#25D366" />
              <stop offset="100%" stopColor="#1EAA50" />
            </linearGradient>

            {/* Metallic Highlights */}
            <linearGradient id="metalBevel" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </linearGradient>

            {/* Circuit Line Glow Filter */}
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Outer Faceted Armor Shield */}
          <path
            d="M 50 6 L 88 24 L 88 66 L 50 94 L 12 66 L 12 24 Z"
            fill="url(#shieldBase)"
            stroke="url(#neonBorder)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* 2. Inner Metallic Armor Inset */}
          <path
            d="M 50 11 L 83 27 L 83 63 L 50 88 L 17 63 L 17 27 Z"
            fill="url(#metalBevel)"
            opacity="0.25"
          />

          {/* 3. PCB Circuit Micro-Traces (Top & Bottom Flanks) */}
          <path
            d="M 22 32 L 30 32 L 36 26"
            stroke="#25D366"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="36" cy="26" r="2" fill="#00F5D4" />

          <path
            d="M 78 32 L 70 32 L 64 26"
            stroke="#25D366"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="64" cy="26" r="2" fill="#00F5D4" />

          <path
            d="M 22 60 L 30 60 L 36 66"
            stroke="#25D366"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="36" cy="66" r="2" fill="#00F5D4" />

          <path
            d="M 78 60 L 70 60 L 64 66"
            stroke="#25D366"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="64" cy="66" r="2" fill="#00F5D4" />

          {/* 4. Elite Dual "BB" Monogram - Interlocking Cyber Geometry */}
          {/* Primary Main Monogram Shape */}
          <path
            d="M 33 26 H 55 C 64 26 70 30.5 70 37 C 70 41.5 66.5 45 61 46.5 C 68 48 72 53 72 60.5 C 72 68 65 73 55 73 H 33 V 26 Z"
            fill="url(#cyberCore)"
            filter="url(#emeraldGlow)"
            opacity="0.15"
          />

          {/* High-Precision Vector Geometry for 'BB' */}
          <path
            d="M 32 25 L 53 25 C 61.5 25 67 29.5 67 36 C 67 40.5 63.8 44 58.5 45.2 C 65 46.6 69 51 69 58 C 69 66.5 62 72 53 72 L 32 72 Z"
            fill="none"
            stroke="url(#cyberCore)"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Upper Loop of 'B' */}
          <path
            d="M 41 33 H 52 C 55.5 33 58 34.5 58 37.5 C 58 40.5 55.5 42 52 42 H 41 V 33 Z"
            fill="#090D10"
            stroke="#25D366"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Lower Loop of 'B' */}
          <path
            d="M 41 49 H 53 C 57 49 60 51 60 55 C 60 59 57 61 53 61 H 41 V 49 Z"
            fill="#090D10"
            stroke="#25D366"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Architectural Left Backbone (Dual 'B' Intersect) */}
          <rect x="30" y="24" width="4.5" height="49" rx="1.5" fill="url(#neonBorder)" />

          {/* Secondary Forward Wing Monogram Facet (Echo of the second B) */}
          <path
            d="M 68 39 L 75 44 L 68 49"
            stroke="#00F5D4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 70 53 L 77 58 L 70 63"
            stroke="#00F5D4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 5. Central Power Reactor Diode / Pulse Core */}
          <polygon
            points="50,45 54,49 50,53 46,49"
            fill="#FFFFFF"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Brand Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-display font-extrabold tracking-wider text-white antialiased ${titleSizes[size]}`}>
              BHAI BHAI
            </span>
            <span
              className={`font-display font-extrabold tracking-wider text-[#25D366] antialiased drop-shadow-[0_0_12px_rgba(37,211,102,0.35)] ${titleSizes[size]}`}
            >
              TECH
            </span>
            <span
              className={`font-display font-extrabold tracking-wider text-[#00F5D4] antialiased drop-shadow-[0_0_12px_rgba(0,245,212,0.35)] ${titleSizes[size]}`}
            >
              WORLD
            </span>
          </div>

          {showTagline && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                {subtext}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
