"use client";
import {
  FullscreenButton,
  MuteButton,
} from "@/app/components/editor/player/remotion/PlayerButton";
import { MediaFile } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PlayerRef } from "@remotion/player";
import {
  Download,
  FolderOpen,
  ImageIcon,
  Music,
  Pause,
  Play,
  Type,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import UploadMedia from "../../../components/editor/AssetsPanel/AddButtons/UploadMedia";
import AddText from "../../../components/editor/AssetsPanel/tools-section/AddText";
import ExportList from "../../../components/editor/AssetsPanel/tools-section/ExportList";
import MediaList from "../../../components/editor/AssetsPanel/tools-section/MediaList";
import { PreviewPlayer } from "../../../components/editor/player/remotion/Player";
import VideoPlayerContainer from "../../../components/editor/player/VideoPlayerContainer";
import AspectRatioControl from "../../../components/editor/player/AspectRatioControl";
import MediaProperties from "../../../components/editor/PropertiesSection/MediaProperties";
import TextProperties from "../../../components/editor/PropertiesSection/TextProperties";
import { Timeline } from "../../../components/editor/timeline/Timline";
import {
  getFile,
  getProject,
  storeProject,
  useAppDispatch,
  useAppSelector,
} from "../../../store";
import {
  rehydrate,
  setActiveSection,
  setMediaFiles,
} from "../../../store/slices/projectSlice";
import {
  setCurrentProject,
  updateProject,
} from "../../../store/slices/projectsSlice";

export default function Project({ params }: { params: { id: string } }) {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (player) {
      if (player.isPlaying()) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    }
  }, []);
  const { id } = params;
  const dispatch = useAppDispatch();
  const projectState = useAppSelector((state) => state.projectState);
  const { currentProjectId } = useAppSelector((state) => state.projects);
  const [isLoading, setIsLoading] = useState(true);
  // Text fields for width/height to allow clearing while typing
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [widthInput, setWidthInput] = useState<string>("1920");
  const [heightInput, setHeightInput] = useState<string>("1080");
  const widthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);

  const handleWidthChange = useCallback((newWidth: number) => {
    setWidth(newWidth);
    setWidthInput(String(newWidth));
  }, []);

  const handleHeightChange = useCallback((newHeight: number) => {
    setHeight(newHeight);
    setHeightInput(String(newHeight));
  }, []);

  // Handler for when aspect ratio changes
  const handleDimensionChange = useCallback((newWidth: number, newHeight: number) => {
    setWidth(newWidth);
    setHeight(newHeight);
    setWidthInput(String(newWidth));
    setHeightInput(String(newHeight));
  }, []);

  const [isAutoSize, setIsAutoSize] = useState<boolean>(false);
  const commitWidth = useCallback(() => {
    const parsed = Number(widthInput);
    const safe = !isFinite(parsed) || parsed <= 0 ? 1920 : parsed;
    setWidth(safe);
    setWidthInput(String(safe));
  }, [widthInput]);

  const commitHeight = useCallback(() => {
    const parsed = Number(heightInput);
    const safe = !isFinite(parsed) || parsed <= 0 ? 1080 : parsed;
    setHeight(safe);
    setHeightInput(String(safe));
  }, [heightInput]);

  const router = useRouter();
  const { activeSection, activeElement, filesID } = projectState;
  // when page is loaded set the project id if it exists
  useEffect(() => {
    const loadProject = async () => {
      if (id) {
        setIsLoading(true);
        const project = await getProject(id);
        if (project) {
          dispatch(setCurrentProject(id));
          setIsLoading(false);
        } else {
          router.push("/404");
        }
      }
    };
    loadProject();
  }, [id, dispatch]);

  // set project state from with the current project id
  useEffect(() => {
    const loadProject = async () => {
      if (currentProjectId) {
        const project = await getProject(currentProjectId);
        if (project) {
          dispatch(rehydrate(project));

          dispatch(
            setMediaFiles(
              await Promise.all(
                project.mediaFiles.map(async (media: MediaFile) => {
                  const file = await getFile(media.fileId);
                  return { ...media, src: URL.createObjectURL(file) };
                })
              )
            )
          );
        }
      }
    };
    loadProject();
  }, [dispatch, currentProjectId]);

  // save
  useEffect(() => {
    const saveProject = async () => {
      if (!projectState || projectState.id != currentProjectId) return;
      await storeProject(projectState);
      dispatch(updateProject(projectState));
    };
    saveProject();
  }, [projectState, dispatch]);

  const handleFocus = (section: "media" | "text" | "export") => {
    dispatch(setActiveSection(section));
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Loading screen */}
      {isLoading ? (
        <div className="fixed inset-0 flex items-center bg-black bg-opacity-50 justify-center z-50">
          <div className="bg-black bg-opacity-70 p-6 rounded-lg flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-white border-r-white border-opacity-30 border-t-opacity-100 rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-lg">Loading project...</p>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col flex-1 basis-[70%] max-h-[70%]">
        {/* Top Navigation - Horizontal Tabs */}
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Tab Content */}
          <div className="flex-[0.3] min-w-[280px] border-r border-border overflow-y-auto">
            <div className="border-b border-border bg-background">
              <div className="px-6 py-3">
                <Tabs
                  value={activeSection}
                  onValueChange={(value) => handleFocus(value as any)}
                >
                  <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger
                      value="media"
                      className="flex items-center gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Library
                    </TabsTrigger>
                    <TabsTrigger
                      value="text"
                      className="flex items-center gap-2"
                    >
                      <Type className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger
                      value="export"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <Tabs
              value={activeSection}
              onValueChange={(value) => handleFocus(value as any)}
            >
              <TabsContent value="media" className="p-0 m-0">
                <div className="py-2 px-6 m-0 h-full">
                  <div className="space-y-4">
                    <UploadMedia />
                  </div>
                  <div className="flex-1 min-h-0">
                    <MediaList />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="p-4 px-6 m-0 h-full ">
                <AddText />
              </TabsContent>

              <TabsContent value="export" className="px-4 m-0">
                <ExportList />
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Video Preview */}
          <div className="flex items-center justify-center flex-col flex-[1] overflow-hidden bg-muted/30 w-full">
            {/* <ProjectName />
            <PreviewPlayer /> */}

            <div className="h-full flex flex-col bg-background w-full">
              <div className="h-10 border-b border-border/50 bg-muted/30 flex items-center justify-between px-3 shrink-0 gap-2">
                <div className="flex items-center gap-2">
                  <AspectRatioControl onDimensionChange={handleDimensionChange} />
                </div>
              </div>
              {/* Video preview with new container */}
              <VideoPlayerContainer
                playerRef={playerRef}
                compositionWidth={width}
                compositionHeight={height}
              />

              {/* External Player Controls (kept outside the preview) */}
              <div className="w-full flex items-center justify-center gap-2 py-2 px-4 border-t border-border/50 bg-background/60">
                {/* Left side controls */}
                <div className="flex items-center gap-1">
                  <MuteButton playerRef={playerRef} />
                </div>

                {/* Center play/pause button */}
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayback}
                    className="h-7 px-2"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-1">
                  <FullscreenButton playerRef={playerRef} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Element Properties */}
          <div className="flex-[0.3] min-w-[280px] border-l border-border overflow-y-auto p-4">
            {activeElement === "media" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Media Properties</h2>
                <MediaProperties />
              </div>
            )}
            {activeElement === "text" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Text Properties</h2>
                <TextProperties />
              </div>
            )}
            {!activeElement && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select an element to view properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Timeline at bottom */}
      <div className="flex flex-row border-t border-border basis-[30%] ">
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="relative h-16">
            <div className="flex items-center gap-2 p-4">
              <Video className="h-4 w-4" />
            </div>
          </div>

          <div className="relative h-16">
            <div className="flex items-center gap-2 p-4">
              <Music className="h-4 w-4" />
            </div>
          </div>

          <div className="relative h-16">
            <div className="flex items-center gap-2 p-4">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="relative h-16">
            <div className="flex items-center gap-2 p-4">
              <Type className="h-4 w-4" />
            </div>
          </div>
        </div>
        <Timeline />
      </div>
    </div>
  );
}
