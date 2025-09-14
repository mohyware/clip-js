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
import { throttle } from "lodash";
import { Check, Copy, Scissors, Trash2, X } from "lucide-react";
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
    if (!timelineRef.current) return;

    dispatch(setIsPlaying(false));
    const rect = timelineRef.current.getBoundingClientRect();

    const scrollOffset = timelineRef.current.scrollLeft;
    const offsetX = e.clientX - rect.left + scrollOffset;

    const seconds = offsetX / timelineZoom;
    const clampedTime = Math.max(0, Math.min(duration, seconds));

    dispatch(setCurrentTime(clampedTime));
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-row items-center justify-between gap-12 w-full">
        <div className="flex flex-row items-center gap-2">
          {/* Track Marker */}
          <button
            onClick={() => dispatch(setMarkerTrack(!enableMarkerTracking))}
            className="timeline-button bg-secondary text-secondary-foreground border hover:bg-accent mt-2 h-auto px-2 py-1"
          >
            {enableMarkerTracking ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="ml-2">
              Track Marker <span className="text-xs">(T)</span>
            </span>
          </button>
          {/* Split */}
          <button
            onClick={handleSplit}
            className="timeline-button bg-secondary text-secondary-foreground border hover:bg-accent mt-2 h-auto px-2 py-1"
          >
            <Scissors className="h-4 w-4" />
            <span className="ml-2">
              Split <span className="text-xs">(S)</span>
            </span>
          </button>
          {/* Duplicate */}
          <button
            onClick={handleDuplicate}
            className="timeline-button bg-secondary text-secondary-foreground border hover:bg-accent mt-2 h-auto px-2 py-1"
          >
            <Copy className="h-4 w-4" />
            <span className="ml-2">
              Duplicate <span className="text-xs">(D)</span>
            </span>
          </button>
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="timeline-button bg-destructive text-destructive-foreground border hover:bg-destructive/90 mt-2 h-auto px-2 py-1"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-2">
              Delete <span className="text-xs">(Del)</span>
            </span>
          </button>
        </div>

        {/* Timeline Zoom */}
        <div className="flex flex-row justify-between items-center gap-2 mr-4">
          <label className="block text-sm mt-1 font-semibold text-foreground">
            Zoom
          </label>
          <span className="text-foreground text-lg">-</span>
          <input
            type="range"
            min={30}
            max={120}
            step="1"
            value={timelineZoom}
            onChange={(e) => throttledZoom(Number(e.target.value))}
            className="w-[100px] bg-background border border-border shadow-md text-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-foreground text-lg">+</span>
        </div>
      </div>

      <div
        className="relative overflow-x-auto w-full border-t border-border bg-background z-10"
        ref={timelineRef}
        onClick={handleClick}
      >
        {/* Timeline Header */}
        <Header />

        <div
          className="bg-background"
          style={{
            width: "100%" /* or whatever width your timeline requires */,
          }}
        >
          {/* Timeline cursor */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-destructive z-50"
            style={{
              left: `${currentTime * timelineZoom}px`,
            }}
          />
          {/* Timeline elements */}
          <div className="w-full">
            <div className="relative h-16 z-10">
              <VideoTimeline />
            </div>

            <div className="relative h-16 z-10">
              <AudioTimeline />
            </div>

            <div className="relative h-16 z-10">
              <ImageTimeline />
            </div>

            <div className="relative h-16 z-10">
              <TextTimeline />
            </div>
          </div>
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
