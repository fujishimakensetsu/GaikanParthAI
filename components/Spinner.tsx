import React from 'react';

interface SpinnerProps {
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  message = 'Enhancing your visualization...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Architectural geometric spinner */}
      <div className="relative w-24 h-24">
        {/* Outer rotating square */}
        <div className="absolute inset-0 border border-arch-gold/30 rotate-45 animate-spin-slow" />

        {/* Middle rotating square - opposite direction */}
        <div
          className="absolute inset-3 border border-arch-gold/50 rotate-45"
          style={{ animation: 'spin 15s linear infinite reverse' }}
        />

        {/* Inner pulsing diamond */}
        <div className="absolute inset-6 bg-gradient-to-br from-arch-gold/20 to-arch-copper/20 rotate-45 animate-pulse-slow" />

        {/* Center dot */}
        <div className="absolute inset-[42%] bg-arch-gold rounded-full animate-pulse" />

        {/* Corner accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-arch-gold rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-arch-gold rounded-full" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-arch-gold rounded-full" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-arch-gold rounded-full" />
      </div>

      {/* Progress indicator */}
      <div className="space-y-3 text-center">
        <p className="text-arch-cream/80 text-sm font-medium tracking-wide">
          {message}
        </p>

        {/* Animated progress bar */}
        <div className="w-48 h-0.5 bg-arch-steel/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-arch-gold via-arch-copper to-arch-gold rounded-full"
            style={{
              animation: 'shimmer 1.5s ease-in-out infinite',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        <p className="text-arch-mist/40 text-xs font-mono tracking-wider">
          PROCESSING
        </p>
      </div>
    </div>
  );
};
