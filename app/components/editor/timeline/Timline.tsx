import { useAppSelector } from "@/app/store";
import {
  setActiveElement,
  setCurrentTime,
  setIsPlaying,
  setMarkerTrack,
  setMediaFiles,
  setTextElements,
  setTimelineZoom,
} from "@/app/store/slices/projectSlice";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { throttle } from "lodash";
import { Check, Copy, Scissors, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";
import { memo, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import GlobalKeyHandlerProps from "../../../components/editor/keys/GlobalKeyHandlerProps";
import Header from "./Header";
import AudioTimeline from "./elements-timeline/AudioTimline";
import ImageTimeline from "./elements-timeline/ImageTimeline";
import TextTimeline from "./elements-timeline/TextTimeline";
import VideoTimeline from "./elements-timeline/VideoTimeline";
export const Timeline = () => {
  const {
    currentTime,
    timelineZoom,
    enableMarkerTracking,
    activeElement,
    activeElementIndex,
    mediaFiles,
    textElements,
    duration,
    isPlaying,
  } = useAppSelector((state) => state.projectState);
  const dispatch = useDispatch();
  const timelineRef = useRef<HTMLDivElement>(null);

  const throttledZoom = useMemo(
    () =>
      throttle((value: number) => {
        dispatch(setTimelineZoom(value));
      }, 100),
    [dispatch]
  );

  const handleSplit = () => {
    let element = null;
    let elements = null;
    let setElements = null;

    if (!activeElement) {
      toast.error("No element selected.");
      return;
    }

    if (activeElement === "media") {
      elements = [...mediaFiles];
      element = elements[activeElementIndex];
      setElements = setMediaFiles;

      if (!element) {
        toast.error("No element selected.");
        return;
      }

      const { positionStart, positionEnd } = element;

      if (currentTime <= positionStart || currentTime >= positionEnd) {
        toast.error("Marker is outside the selected element bounds.");
        return;
      }

      const positionDuration = positionEnd - positionStart;

      // Media logic (uses startTime/endTime for trimming)
      const { startTime, endTime } = element;
      const sourceDuration = endTime - startTime;
      const ratio = (currentTime - positionStart) / positionDuration;
      const splitSourceOffset = startTime + ratio * sourceDuration;

      const firstPart = {
        ...element,
        id: crypto.randomUUID(),
        positionStart,
        positionEnd: currentTime,
        startTime,
        endTime: splitSourceOffset,
      };

      const secondPart = {
        ...element,
        id: crypto.randomUUID(),
        positionStart: currentTime,
        positionEnd,
        startTime: splitSourceOffset,
        endTime,
      };

      elements.splice(activeElementIndex, 1, firstPart, secondPart);
    } else if (activeElement === "text") {
      elements = [...textElements];
      element = elements[activeElementIndex];
      setElements = setTextElements;

      if (!element) {
        toast.error("No element selected.");
        return;
      }

      const { positionStart, positionEnd } = element;

      if (currentTime <= positionStart || currentTime >= positionEnd) {
        toast.error("Marker is outside the selected element.");
        return;
      }

      const firstPart = {
        ...element,
        id: crypto.randomUUID(),
        positionStart,
        positionEnd: currentTime,
      };

      const secondPart = {
        ...element,
        id: crypto.randomUUID(),
        positionStart: currentTime,
        positionEnd,
      };

      elements.splice(activeElementIndex, 1, firstPart, secondPart);
    }

    if (elements && setElements) {
      dispatch(setElements(elements as any));
      dispatch(setActiveElement(null));
      toast.success("Element split successfully.");
    }
  };

  const handleDuplicate = () => {
    let element = null;
    let elements = null;
    let setElements = null;

    if (activeElement === "media") {
      elements = [...mediaFiles];
      element = elements[activeElementIndex];
      setElements = setMediaFiles;
    } else if (activeElement === "text") {
      elements = [...textElements];
      element = elements[activeElementIndex];
      setElements = setTextElements;
    }

    if (!element) {
      toast.error("No element selected.");
      return;
    }

    const duplicatedElement = {
      ...element,
      id: crypto.randomUUID(),
    };

    if (elements) {
      elements.splice(activeElementIndex + 1, 0, duplicatedElement as any);
    }

    if (elements && setElements) {
      dispatch(setElements(elements as any));
      dispatch(setActiveElement(null));
      toast.success("Element duplicated successfully.");
    }
  };

  const handleDelete = () => {
    // @ts-ignore
    let element = null;
    let elements = null;
    let setElements = null;

    if (activeElement === "media") {
      elements = [...mediaFiles];
      element = elements[activeElementIndex];
      setElements = setMediaFiles;
    } else if (activeElement === "text") {
      elements = [...textElements];
      element = elements[activeElementIndex];
      setElements = setTextElements;
    }

    if (!element) {
      toast.error("No element selected.");
      return;
    }

    if (elements) {
      // @ts-ignore
      elements = elements.filter((ele) => ele.id !== element.id);
    }

    if (elements && setElements) {
      dispatch(setElements(elements as any));
      dispatch(setActiveElement(null));
      toast.success("Element deleted successfully.");
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get the ScrollArea viewport element
    const scrollAreaViewport = e.currentTarget.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollAreaViewport) return;

    dispatch(setIsPlaying(false));
    const rect = scrollAreaViewport.getBoundingClientRect();

    const scrollOffset = scrollAreaViewport.scrollLeft;
    const offsetX = e.clientX - rect.left + scrollOffset;

    const seconds = offsetX / timelineZoom;
    const clampedTime = Math.max(0, Math.min(duration, seconds));

    dispatch(setCurrentTime(clampedTime));
  };

  // Calculate the minimum width to match the timeline header
  const totalSeconds = Math.max(duration + 2, 61);
  const timelineWidth = totalSeconds * timelineZoom;

  return (
    <div className="flex w-full flex-col gap-1 p-1 bg-background border rounded-lg shadow-sm h-full">
      {/* Timeline Controls Header */}
      <div className="flex flex-row items-center justify-between gap-4 w-full shrink-0">
        {/* Action Buttons */}
        <div className="flex flex-row items-center gap-2">
          <Button
            onClick={() => dispatch(setMarkerTrack(!enableMarkerTracking))}
            variant={enableMarkerTracking ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            {enableMarkerTracking ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Track Marker
            <span className="text-xs opacity-60">(T)</span>
          </Button>

          <Button
            onClick={handleSplit}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!activeElement}
          >
            <Scissors className="h-4 w-4" />
            Split
            <span className="text-xs opacity-60">(S)</span>
          </Button>

          <Button
            onClick={handleDuplicate}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!activeElement}
          >
            <Copy className="h-4 w-4" />
            Duplicate
            <span className="text-xs opacity-60">(D)</span>
          </Button>

          <Button
            onClick={handleDelete}
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={!activeElement}
          >
            <Trash2 className="h-4 w-4" />
            Delete
            <span className="text-xs opacity-60">(Del)</span>
          </Button>
        </div>

        {/* Timeline Zoom Control */}
        <div className="flex flex-row items-center gap-3 px-4 py-2 bg-muted rounded-md">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">Zoom</span>
            <Slider
              value={[timelineZoom]}
              onValueChange={(value) => throttledZoom(value[0])}
              min={30}
              max={120}
              step={1}
              className="w-24"
            />
          </div>
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Timeline Container */}
      <div
        className="relative w-full border border-border bg-background rounded-md shadow-inner flex-1 flex flex-col min-h-0"
        ref={timelineRef}
      >
        {/* Timeline Header */}
        <Header />

        {/* Timeline Content */}
        <div className="bg-background relative flex-1 min-h-0" onClick={handleClick}>
          {/* Timeline Tracks */}
          <ScrollArea className="h-full w-full mb-4">
            <div className="relative h-full w-full">
              {/* Timeline Cursor */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-destructive z-50 shadow-sm pointer-events-none"
                style={{
                  left: `${currentTime * timelineZoom}px`,
                }}
              />
              
              <div 
                className="w-full divide-y divide-border"
                style={{
                  minWidth: `${timelineWidth}px`,
                }}
              >
                <div className="relative h-12 hover:bg-muted/20 transition-colors w-full">
                  <VideoTimeline />
                </div>

                <div className="relative h-12 hover:bg-muted/20 transition-colors w-full">
                  <AudioTimeline />
                </div>

                <div className="relative h-12 hover:bg-muted/20 transition-colors w-full">
                  <ImageTimeline />
                </div>

                <div className="relative h-12 hover:bg-muted/20 transition-colors w-full">
                  <TextTimeline />
                </div>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>
      
      <GlobalKeyHandlerProps
        handleDuplicate={handleDuplicate}
        handleSplit={handleSplit}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default memo(Timeline);
