import { PreviewPlayer } from './remotion/Player';
import { type PlayerRef } from '@remotion/player';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/app/store';

interface VideoPlayerContainerProps {
  playerRef: React.RefObject<PlayerRef>;
  compositionWidth: number;
  compositionHeight: number;
}

export default function VideoPlayerContainer({ 
  playerRef, 
  compositionWidth, 
  compositionHeight
}: VideoPlayerContainerProps) {
  const { resolution } = useAppSelector((state) => state.projectState);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use Redux resolution as source of truth, fallback to props
  const actualWidth = resolution.width || compositionWidth;
  const actualHeight = resolution.height || compositionHeight;
  
  const [boxSize, setBoxSize] = useState<{width: number; height: number}>({width: actualWidth, height: actualHeight});

  // Debounced resize calculation for better performance
  const calculateSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const padding = 32; // breathing room so it never hugs edges
    const availableWidth = Math.max(0, el.clientWidth - padding * 2);
    const availableHeight = Math.max(0, el.clientHeight - padding * 2);
    
    // Ensure we have minimum dimensions to work with
    if (availableWidth <= 0 || availableHeight <= 0) {
      setBoxSize({ width: 320, height: 180 }); // Fallback minimum size
      return;
    }

    // Calculate scale to fit within available space while maintaining aspect ratio
    const widthScale = availableWidth / actualWidth;
    const heightScale = availableHeight / actualHeight;
    const scale = Math.min(widthScale, heightScale, 1); // Don't scale up beyond original size
    
    const width = Math.floor(actualWidth * scale);
    const height = Math.floor(actualHeight * scale);
    
    setBoxSize({ width, height });
  }, [actualWidth, actualHeight]);

  // Compute best-fit size so the player always fits without needing browser zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial computation
    calculateSize();
    
    // Set up resize observer for dynamic resizing
    const ro = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        calculateSize();
      });
    });
    
    ro.observe(el);
    
    // Also listen for window resize as backup
    const handleWindowResize = () => {
      requestAnimationFrame(() => {
        calculateSize();
      });
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calculateSize]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-0 flex items-center justify-center overflow-hidden"
      style={{ minHeight: '200px' }} // Ensure minimum height for proper calculation
    >
      <div 
        className="relative bg-black shadow-2xl border border-border/50 rounded-lg overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          width: `${boxSize.width}px`,
          height: `${boxSize.height}px`,
          aspectRatio: `${actualWidth} / ${actualHeight}`,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <PreviewPlayer
          compositionWidth={actualWidth}
          playerRef={playerRef}
          compositionHeight={actualHeight}
        />
      </div>
    </div>
  );
}
