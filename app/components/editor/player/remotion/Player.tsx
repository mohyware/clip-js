import { Player, type PlayerRef } from "@remotion/player";
import Composition from "./sequence/composition";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { useRef, useState, useEffect } from "react";
import { setIsPlaying } from "@/app/store/slices/projectSlice";
import { useDispatch } from "react-redux";

const fps = 30;

type Props = {
  compositionWidth: number;
  compositionHeight: number;
    playerRef: React.RefObject<PlayerRef>;
};
export const PreviewPlayer = ({
  compositionWidth,
  playerRef,
  compositionHeight,
}: Props) => {
  const projectState = useAppSelector((state) => state.projectState);
  const { duration, currentTime, isPlaying, isMuted, resolution } = projectState;
  console.log({projectState})
  const dispatch = useDispatch();
  // update frame when current time with marker
  useEffect(() => {
    const frame = Math.round(currentTime * fps);
    if (playerRef.current && !isPlaying) {
      playerRef.current.pause();
      playerRef.current.seekTo(frame);
    }
  }, [currentTime, fps]);

  useEffect(() => {
    playerRef?.current?.addEventListener("play", () => {
      dispatch(setIsPlaying(true));
    });
    playerRef?.current?.addEventListener("pause", () => {
      dispatch(setIsPlaying(false));
    });
    return () => {
      playerRef?.current?.removeEventListener("play", () => {
        dispatch(setIsPlaying(true));
      });
      playerRef?.current?.removeEventListener("pause", () => {
        dispatch(setIsPlaying(false));
      });
    };
  }, [playerRef]);

  // to control with keyboard
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.mute();
    } else {
      playerRef.current.unmute();
    }
  }, [isMuted]);

  const durationInFrames = duration ? Math.floor(duration * fps) : 1;
  const safeDuration = Math.max(1, durationInFrames || 1);

  // Guard against invalid dimensions (e.g., user typed 0, only-audio timelines)
  // Use Redux resolution as the source of truth, fall back to props if needed
  const safeWidth = resolution.width || compositionWidth || 1920;
  const safeHeight = resolution.height || compositionHeight || 1080;

  return (
  <Player
      ref={playerRef}
      component={Composition}
      inputProps={{}}
      durationInFrames={safeDuration}
      compositionWidth={safeWidth}
      compositionHeight={safeHeight}
      fps={30}
      style={{
    width: "100%",
    height: "100%",
    position: "relative",
    zIndex: 1,
    display: 'block',
      }}
      acknowledgeRemotionLicense={true}
    />
  );
};
