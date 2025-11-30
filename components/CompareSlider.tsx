import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({ beforeImage, afterImage }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleTouchStart = () => setIsResizing(true);

  const handleMouseUp = useCallback(() => setIsResizing(false), []);
  
  const handleMove = useCallback((clientX: number) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    
    const newPosition = Math.min(Math.max((x / width) * 100, 0), 100);
    setSliderPosition(newPosition);
  }, [isResizing]);

  const handleMouseMove = useCallback((e: MouseEvent) => handleMove(e.clientX), [handleMove]);
  const handleTouchMove = useCallback((e: TouchEvent) => handleMove(e.touches[0].clientX), [handleMove]);

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
      className="relative w-full h-[500px] overflow-hidden rounded-xl select-none cursor-ew-resize shadow-2xl border border-slate-700 bg-slate-800 group"
    >
      {/* After Image (Base) */}
      <img 
        src={afterImage} 
        alt="Enhanced" 
        className="absolute top-0 left-0 w-full h-full object-contain bg-slate-900" 
        draggable={false}
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute top-0 left-0 h-full w-full overflow-hidden bg-slate-900"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt="Original" 
          className="absolute top-0 left-0 w-full h-[500px] max-w-none object-contain"
          style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%' }}
          draggable={false}
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded pointer-events-none">Original</div>
      <div className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur text-white text-xs px-2 py-1 rounded pointer-events-none">Enhanced</div>
    </div>
  );
};