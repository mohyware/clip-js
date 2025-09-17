import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../../../store";

export const Header = () => {
  const { duration, currentTime, timelineZoom, enableMarkerTracking } =
    useAppSelector((state) => state.projectState);
  const secondInterval = 0.2; // Every 0.2s
  const totalSeconds = Math.max(duration + 2, 61);
  const tickMarkers = Array.from(
    { length: totalSeconds / secondInterval },
    (_, i) => i * secondInterval
  );

  // to track the marker when time changes
  const markerRefs = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const roundedTime = Math.floor(currentTime);
    const el = markerRefs.current[roundedTime];
    if (el && el.scrollIntoView && enableMarkerTracking) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentTime]);

  return (
    <div className="flex items-end py-3 w-full bg-muted/20 border-b border-border" ref={containerRef}>
      <div className="relative h-10">
        {tickMarkers.map((marker) => {
          const isWholeSecond = Number.isInteger(marker) && marker !== 0;
          const isMinorTick = marker % 1 === 0.5; // Half-second marks
          return (
            <div
              ref={(el) => {
                if (el) markerRefs.current[marker] = el;
              }}
              key={marker}
              className="absolute flex flex-col items-center"
              style={{
                left: `${marker * timelineZoom}px`,
                width: `1px`,
                height: "100%",
              }}
            >
              {/* Enhanced Tick lines */}
              <div
                className={`
                  w-px transition-colors duration-200
                  ${isWholeSecond 
                    ? "h-8 bg-border shadow-sm" 
                    : isMinorTick 
                      ? "h-4 bg-muted-foreground/60" 
                      : "h-2 bg-muted-foreground/40"
                  }
                `}
              />

              {/* Modern second labels */}
              {isWholeSecond && (
                <div className="mt-1 px-1">
                  <span className="text-[10px] font-medium text-muted-foreground cursor-default 
                                 bg-background/80 rounded px-1 py-0.5 shadow-sm border border-border/50">
                    {marker}s
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Header;
