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
    <div className="space-y-6">
      {/* Export Overview Card */}
      <div className="rounded-lg border bg-background/50 backdrop-blur-sm p-4 space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Export Video</h3>
              <p className="text-sm text-muted-foreground">
                {loadFfmpeg ? "Ready to render your project" : "Preparing export engine..."}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {mediaFiles.length === 0 && textElements.length === 0 ? (
              <Badge variant="secondary" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                No content
              </Badge>
            ) : loadFfmpeg ? (
              <Badge variant="default" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading
              </Badge>
            )}
          </div>
        </div>

        {/* Content Summary */}
        {(mediaFiles.length > 0 || textElements.length > 0) && (
          <div className="flex items-center gap-4 p-3 rounded-md bg-muted/30">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{mediaFiles.length}</span>
              <span className="text-xs text-muted-foreground">
                media file{mediaFiles.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">T</span>
              <span className="text-sm font-medium">{textElements.length}</span>
              <span className="text-xs text-muted-foreground">
                text element{textElements.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={() => render()}
          className="w-full h-12"
          size="lg"
          disabled={
            !loadFfmpeg ||
            isRendering ||
            (mediaFiles.length === 0 && textElements.length === 0)
          }
        >
          {!loadFfmpeg ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading FFmpeg Engine...
            </>
          ) : isRendering ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Rendering Video...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </>
          )}
        </Button>
      </div>

      {/* Empty State */}
      {mediaFiles.length === 0 && textElements.length === 0 && (
        <div className="text-center py-8 px-4 rounded-lg border border-dashed bg-muted/20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
            <Play className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="font-medium mb-2">No content to export</h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Add media files or text elements to your timeline to start creating your video
          </p>
        </div>
      )}

      {/* Render Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-background rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {isRendering ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <Play className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {isRendering ? "Rendering Video" : "Export Complete"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isRendering ? "Processing your project..." : projectName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isRendering ? (
                <div className="space-y-6">
                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processing timeline</span>
                      <Badge variant="outline" className="gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        In Progress
                      </Badge>
                    </div>
                    <FfmpegProgressBar ffmpeg={ffmpeg} />
                  </div>

                  {/* Log Output */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Processing Log</label>
                    <div className="bg-muted/50 border rounded-lg p-4 h-32 overflow-auto font-mono text-xs">
                      <div className="whitespace-pre-wrap">{logMessages}</div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Progress indication is experimental with FFmpeg WASM and may appear slower than actual processing
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Video Preview */}
                  {previewUrl && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Preview</label>
                      <div className="relative rounded-lg overflow-hidden border bg-black">
                        <video 
                          src={previewUrl} 
                          controls 
                          className="w-full aspect-video"
                          preload="metadata"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="flex-1"
                    >
                      <a href={previewUrl || "#"} download={`${projectName}.mp4`}>
                        <Save className="w-4 h-4 mr-2" />
                        Download Video
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="sm:w-auto">
                      <a
                        href="https://github.com/sponsors/mohyware"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Support Project
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
