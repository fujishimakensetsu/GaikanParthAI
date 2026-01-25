import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  beforeImage,
  afterImage,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleTouchStart = () => setIsResizing(true);

  const handleMouseUp = useCallback(() => setIsResizing(false), []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;

      const newPosition = Math.min(Math.max((x / width) * 100, 2), 98);
      setSliderPosition(newPosition);
    },
    [isResizing]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => handleMove(e.clientX),
    [handleMove]
  );
  const handleTouchMove = useCallback(
    (e: TouchEvent) => handleMove(e.touches[0].clientX),
    [handleMove]
  );

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseUp, handleMouseMove, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[550px] overflow-hidden select-none cursor-ew-resize group corner-accent"
      style={{
        background:
          'linear-gradient(135deg, rgba(20,20,22,0.9) 0%, rgba(10,10,11,0.95) 100%)',
      }}
    >
      {/* Subtle inner border glow */}
      <div className="absolute inset-0 border border-arch-gold/10 pointer-events-none z-20" />

      {/* After Image (Base) */}
      <img
        src={afterImage}
        alt="Enhanced"
        className="absolute top-0 left-0 w-full h-full object-contain"
        style={{ background: 'radial-gradient(ellipse at center, #1c1c1f 0%, #0a0a0b 100%)' }}
        draggable={false}
      />

      {/* Before Image (Clipped) */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{
          width: `${sliderPosition}%`,
          background: 'radial-gradient(ellipse at center, #1c1c1f 0%, #0a0a0b 100%)',
        }}
      >
        <img
          src={beforeImage}
          alt="Original"
          className="absolute top-0 left-0 h-full max-w-none object-contain"
          style={{
            width: containerRef.current ? containerRef.current.clientWidth : '100%',
          }}
          draggable={false}
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 z-10 flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-arch-gold to-transparent opacity-80" />

        {/* Handle button */}
        <div
          className={`
            relative w-10 h-10
            bg-arch-charcoal border border-arch-gold/50
            flex items-center justify-center
            transition-all duration-200 ease-out
            ${isResizing ? 'scale-110 border-arch-gold shadow-[0_0_20px_rgba(201,169,98,0.4)]' : 'hover:border-arch-gold hover:shadow-[0_0_15px_rgba(201,169,98,0.3)]'}
          `}
          style={{ transform: 'rotate(45deg)' }}
        >
          <div className="transform -rotate-45 flex items-center gap-0.5">
            <svg
              className="w-3 h-3 text-arch-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <svg
              className="w-3 h-3 text-arch-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="px-3 py-1.5 bg-arch-charcoal/90 border border-arch-steel/50 backdrop-blur-sm">
          <span className="text-arch-mist/70 text-xs font-mono tracking-wider uppercase">
            Before
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="px-3 py-1.5 bg-arch-gold/10 border border-arch-gold/30 backdrop-blur-sm">
          <span className="text-arch-gold text-xs font-mono tracking-wider uppercase">
            Enhanced
          </span>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-t from-arch-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between text-xs text-arch-mist/50 font-mono">
          <span>Drag to compare</span>
          <span>{Math.round(sliderPosition)}%</span>
        </div>
      </div>
    </div>
  );
};
