"use client";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useEffect, useRef, useState } from "react";
import { getFile, useAppSelector } from "@/app/store";
import { Heart, Save, Download, Play, Loader2 } from "lucide-react";
import Image from "next/image";
import { extractConfigs } from "@/app/utils/extractConfigs";
import { mimeToExt } from "@/app/types";
import { toast } from "react-hot-toast";
import FfmpegProgressBar from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileUploaderProps {
  loadFunction: () => Promise<void>;
  loadFfmpeg: boolean;
  ffmpeg: FFmpeg;
  logMessages: string;
}
export default function FfmpegRender({
  loadFunction,
  loadFfmpeg,
  ffmpeg,
  logMessages,
}: FileUploaderProps) {
  const { mediaFiles, projectName, exportSettings, duration, textElements, resolution } =
    useAppSelector((state) => state.projectState);
  const totalDuration = duration;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (loaded && videoRef.current && previewUrl) {
      videoRef.current.src = previewUrl;
    }
  }, [loaded, previewUrl]);

  const handleCloseModal = async () => {
    setShowModal(false);
    setIsRendering(false);
    try {
      ffmpeg.terminate();
      await loadFunction();
    } catch (e) {
      console.error("Failed to reset FFmpeg:", e);
    }
  };

  const render = async () => {
    if (mediaFiles.length === 0 && textElements.length === 0) {
      console.log("No media files to render");
      return;
    }
    setShowModal(true);
    setIsRendering(true);

    const renderFunction = async () => {
      const params = extractConfigs(exportSettings);

      try {
        const filters = [];
        const overlays = [];
        const inputs = [];
        const audioDelays = [];

        // Create base black background
        filters.push(
          `color=c=black:size=${resolution.width}x${resolution.height}:d=${totalDuration.toFixed(3)}[base]`
        );
        // Sort videos by zIndex ascending (lowest drawn first)
        const sortedMediaFiles = [...mediaFiles].sort(
          (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
        );

        for (let i = 0; i < sortedMediaFiles.length; i++) {
          // timing
          const { startTime, positionStart, positionEnd } = sortedMediaFiles[i];
          const duration = positionEnd - positionStart;

          // get the file data and write to ffmpeg
          const fileData = await getFile(sortedMediaFiles[i].fileId);
          const buffer = await fileData.arrayBuffer();
          const ext =
            mimeToExt[fileData.type as keyof typeof mimeToExt] ||
            fileData.type.split("/")[1];
          await ffmpeg.writeFile(`input${i}.${ext}`, new Uint8Array(buffer));

          // TODO: currently we have to write same file if it's used more than once in different clips the below approach is a good start to change this
          // let wroteFiles = new Map<string, string>();
          // const { fileId, type } = sortedMediaFiles[i];
          // let inputFilename: string;

          // if (wroteFiles.has(fileId)) {
          //     inputFilename = wroteFiles.get(fileId)!;
          // } else {
          //     const fileData = await getFile(fileId);
          //     const buffer = await fileData.arrayBuffer();
          //     const ext = mimeToExt[fileData.type as keyof typeof mimeToExt] || fileData.type.split('/')[1];
          //     inputFilename = `input_${fileId}.${ext}`;
          //     await ffmpeg.writeFile(inputFilename, new Uint8Array(buffer));
          //     wroteFiles.set(fileId, inputFilename);
          // }

          if (sortedMediaFiles[i].type === "image") {
            inputs.push(
              "-loop",
              "1",
              "-t",
              duration.toFixed(3),
              "-i",
              `input${i}.${ext}`
            );
          } else {
            inputs.push("-i", `input${i}.${ext}`);
          }

          const visualLabel = `visual${i}`;
          const audioLabel = `audio${i}`;

          // Shift clip to correct place on timeline (video)
          if (sortedMediaFiles[i].type === "video") {
            filters.push(
              `[${i}:v]trim=start=${startTime.toFixed(
                3
              )}:duration=${duration.toFixed(3)},scale=${
                sortedMediaFiles[i].width
              }:${
                sortedMediaFiles[i].height
              },setpts=PTS-STARTPTS+${positionStart.toFixed(
                3
              )}/TB[${visualLabel}]`
            );
          }
          if (sortedMediaFiles[i].type === "image") {
            filters.push(
              `[${i}:v]scale=${sortedMediaFiles[i].width}:${
                sortedMediaFiles[i].height
              },setpts=PTS+${positionStart.toFixed(3)}/TB[${visualLabel}]`
            );
          }

          // Apply opacity
          if (
            sortedMediaFiles[i].type === "video" ||
            sortedMediaFiles[i].type === "image"
          ) {
            const alpha = Math.min(
              Math.max((sortedMediaFiles[i].opacity || 100) / 100, 0),
              1
            );
            filters.push(
              `[${visualLabel}]format=yuva420p,colorchannelmixer=aa=${alpha}[${visualLabel}]`
            );
          }

          // Store overlay range that matches shifted time
          if (
            sortedMediaFiles[i].type === "video" ||
            sortedMediaFiles[i].type === "image"
          ) {
            overlays.push({
              label: visualLabel,
              x: sortedMediaFiles[i].x,
              y: sortedMediaFiles[i].y,
              start: positionStart.toFixed(3),
              end: positionEnd.toFixed(3),
            });
          }

          // Audio: trim, then delay (in ms)
          if (
            sortedMediaFiles[i].type === "audio" ||
            sortedMediaFiles[i].type === "video"
          ) {
            const delayMs = Math.round(positionStart * 1000);
            const volume =
              sortedMediaFiles[i].volume !== undefined
                ? sortedMediaFiles[i].volume / 100
                : 1;
            filters.push(
              `[${i}:a]atrim=start=${startTime.toFixed(
                3
              )}:duration=${duration.toFixed(
                3
              )},asetpts=PTS-STARTPTS,adelay=${delayMs}|${delayMs},volume=${volume}[${audioLabel}]`
            );
            audioDelays.push(`[${audioLabel}]`);
          }
        }

        // Apply overlays in z-index order
        let lastLabel = "base";
        if (overlays.length > 0) {
          for (let i = 0; i < overlays.length; i++) {
            const { label, start, end, x, y } = overlays[i];
            const nextLabel = i === overlays.length - 1 ? "outv" : `tmp${i}`;
            filters.push(
              `[${lastLabel}][${label}]overlay=${x}:${y}:enable='between(t\\,${start}\\,${end})'[${nextLabel}]`
            );
            lastLabel = nextLabel;
          }
        }

        // Apply text
        if (textElements.length > 0) {
          // load fonts
          let fonts = ["Arial", "Inter", "Lato"];
          for (let i = 0; i < fonts.length; i++) {
            const font = fonts[i];
            const res = await fetch(`/fonts/${font}.ttf`);
            const fontBuf = await res.arrayBuffer();
            await ffmpeg.writeFile(`font${font}.ttf`, new Uint8Array(fontBuf));
          }
          // Apply text
          for (let i = 0; i < textElements.length; i++) {
            const text = textElements[i];
            const label = i === textElements.length - 1 ? "outv" : `text${i}`;
            const escapedText = text.text
              .replace(/:/g, "\\:")
              .replace(/'/g, "\\\\'");
            const alpha = Math.min(Math.max((text.opacity ?? 100) / 100, 0), 1);
            const color = text.color?.includes("@")
              ? text.color
              : `${text.color || "white"}@${alpha}`;
            filters.push(
              `[${lastLabel}]drawtext=fontfile=font${
                text.font
              }.ttf:text='${escapedText}':x=${text.x}:y=${text.y}:fontsize=${
                text.fontSize || 24
              }:fontcolor=${color}:enable='between(t\\,${
                text.positionStart
              }\\,${text.positionEnd})'[${label}]`
            );
            lastLabel = label;
          }
        }

        // Mix all audio tracks
        if (audioDelays.length > 0) {
          const audioMix = audioDelays.join("");
          filters.push(
            `${audioMix}amix=inputs=${audioDelays.length}:normalize=0[outa]`
          );
        }

        // Final filter_complex
        const complexFilter = filters.join("; ");
        const ffmpegArgs = [
          ...inputs,
          "-filter_complex",
          complexFilter,
          "-map",
          "[outv]",
        ];

        if (audioDelays.length > 0) {
          ffmpegArgs.push("-map", "[outa]");
        }

        ffmpegArgs.push(
          "-c:v",
          "libx264",
          "-c:a",
          "aac",
          "-preset",
          params.preset,
          "-crf",
          params.crf.toString(),
          "-t",
          totalDuration.toFixed(3),
          "output.mp4"
        );

        await ffmpeg.exec(ffmpegArgs);
      } catch (err) {
        console.error("FFmpeg processing error:", err);
      }

      // return the output url
      const outputData = await ffmpeg.readFile("output.mp4");
      // @ts-ignore
      const outputBlob = new Blob([outputData as Uint8Array], {
        type: "video/mp4",
      });
      const outputUrl = URL.createObjectURL(outputBlob);
      return outputUrl;
    };

    // Run the function and handle the result/error
    try {
      const outputUrl = await renderFunction();
      setPreviewUrl(outputUrl);
      setLoaded(true);
      setIsRendering(false);
      toast.success("Video rendered successfully");
    } catch (err) {
      toast.error("Failed to render video");
      console.error("Failed to render video:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mediaFiles.length === 0 && textElements.length === 0 ? (
            <Badge variant="secondary">No content to export</Badge>
          ) : loadFfmpeg ? (
            <Badge variant="default">Ready to export</Badge>
          ) : (
            <Badge variant="outline">Loading FFmpeg...</Badge>
          )}
        </div>
        {(mediaFiles.length > 0 || textElements.length > 0) && (
          <span className="text-xs text-muted-foreground">
            {mediaFiles.length} media file{mediaFiles.length !== 1 ? "s" : ""} +{" "}
            {textElements.length} text element
            {textElements.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Export Button */}
      <Button
        onClick={() => render()}
        className="w-full"
        size="lg"
        disabled={
          !loadFfmpeg ||
          isRendering ||
          (mediaFiles.length === 0 && textElements.length === 0)
        }
      >
        {!loadFfmpeg || isRendering ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadFfmpeg ? "Rendering..." : "Loading FFmpeg..."}
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export Video
          </>
        )}
      </Button>

      {/* Export Tips */}
      {mediaFiles.length === 0 && textElements.length === 0 && (
        <div className="text-center py-4 px-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Add media files or text elements to your timeline to enable export
          </p>
        </div>
      )}

      {/* Render Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-black rounded-xl shadow-lg p-6 max-w-xl w-full">
            {/* Title and close button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isRendering ? "Rendering..." : `${projectName}`}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white text-4xl font-bold hover:text-red-400"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {isRendering ? (
              <div>
                <div className="bg-background border border-border p-2 h-40 text-sm font-mono rounded">
                  <div>{logMessages}</div>
                  <p className="text-xs text-muted-foreground italic">
                    The progress bar is experimental in FFmpeg WASM, so it might
                    appear slow or unresponsive even though the actual
                    processing is not.
                  </p>
                  <FfmpegProgressBar ffmpeg={ffmpeg} />
                </div>
              </div>
            ) : (
              <div>
                {previewUrl && (
                  <video src={previewUrl} controls className="w-full mb-4" />
                )}
                <div className="flex gap-3">
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="flex-1"
                  >
                    <a href={previewUrl || "#"} download={`${projectName}.mp4`}>
                      <Save className="w-4 h-4 mr-2" />
                      Download Video
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a
                      href="https://github.com/sponsors/mohyware"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Sponsor
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
