import React from 'react';
import generatedLogo from '../assets/images/bhai_bhai_logo_1789640552909.jpg';

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
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const titleSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl lg:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Sleek Modern Generated Emblem */}
      <div className={`relative shrink-0 ${iconDimensions[size]} group`}>
        {/* Ambient Backlight Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#25D366]/40 via-[#00F0FF]/25 to-emerald-500/10 blur-md group-hover:blur-lg transition-all duration-300 opacity-80" />

        <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden border border-emerald-500/40 shadow-[0_0_15px_rgba(37,211,102,0.3)] group-hover:border-emerald-400/70 transition-all duration-300 group-hover:scale-105 bg-[#090b0e]">
          <img
            src={generatedLogo}
            alt="Bhai Bhai Tech World Gaming Store Emblem"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Brand Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 leading-none flex-wrap">
            <span className={`font-display font-extrabold tracking-wider text-white antialiased truncate ${titleSizes[size]}`}>
              BHAI BHAI
            </span>
            <span
              className={`font-display font-extrabold tracking-wider text-[#25D366] antialiased drop-shadow-[0_0_12px_rgba(37,211,102,0.4)] ${titleSizes[size]}`}
            >
              TECH
            </span>
            <span
              className={`font-display font-extrabold tracking-wider text-[#00F5D4] antialiased drop-shadow-[0_0_12px_rgba(0,245,212,0.4)] ${titleSizes[size]}`}
            >
              WORLD
            </span>
          </div>

          {showTagline && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-zinc-400 uppercase font-semibold flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                <span className="truncate">{subtext}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

