import { PreviewPlayer } from './remotion/Player';
import { type PlayerRef } from '@remotion/player';
import { useRef, useEffect, useState } from 'react';
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

  // Compute best-fit size so the player always fits without needing browser zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const padding = 16; // breathing room so it never hugs edges
      const availableWidth = Math.max(0, el.clientWidth - padding * 2);
      const availableHeight = Math.max(0, el.clientHeight - padding * 2);
      if (availableWidth === 0 || availableHeight === 0) return;

      const scale = Math.min(
        availableWidth / actualWidth,
        availableHeight / actualHeight
      );
      const width = Math.floor(actualWidth * scale);
      const height = Math.floor(actualHeight * scale);
      setBoxSize({ width, height });
    };

    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [actualWidth, actualHeight]);

  return (
    <div ref={containerRef} className="relative w-full max-full min-h-0 grid place-items-center flex-1 p-4">
      <div 
        className="relative bg-black shadow-2xl border border-border/50 rounded-lg overflow-hidden"
        style={{
          width: `${boxSize.width}px`,
          height: `${boxSize.height}px`,
          aspectRatio: `${actualWidth} / ${actualHeight}`,
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
