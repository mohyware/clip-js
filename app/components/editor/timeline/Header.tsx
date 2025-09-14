import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../store';
export const Header = () => {
    const { duration, currentTime, timelineZoom, enableMarkerTracking } = useAppSelector((state) => state.projectState);
    const secondInterval = 0.2; // Every 0.2s
    const totalSeconds = Math.max(duration + 2, 61);
    const tickMarkers = Array.from({ length: totalSeconds / secondInterval }, (_, i) => i * secondInterval);

    // to track the marker when time changes
    const markerRefs = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const roundedTime = Math.floor(currentTime);
        const el = markerRefs.current[roundedTime];
        if (el && el.scrollIntoView && enableMarkerTracking) {
            el.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [currentTime]);

    return (
        <div className="flex items-center py-2 w-full" ref={containerRef}>
            <div className="relative h-8">
                {tickMarkers.map((marker) => {
                    const isWholeSecond = Number.isInteger(marker) && marker !== 0;
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
                                height: '100%',
                            }}
                        >
                            {/* Tick line */}
                            <div className={`w-px ${isWholeSecond ? 'h-7 bg-border' : 'h-2 bg-muted-foreground'}`} />

                            {/* second labels */}
                            {isWholeSecond && (
                                <span className="mt-1 text-[10px] text-muted-foreground cursor-default">
                                    {marker}s
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

    );
};

export default Header; 