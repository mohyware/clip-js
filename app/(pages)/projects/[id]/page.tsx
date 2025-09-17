"use client";
import {
  FullscreenButton,
  MuteButton,
} from "@/app/components/editor/player/remotion/PlayerButton";
import { MediaFile } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PlayerRef } from "@remotion/player";
import {
  Download,
  FolderOpen,
  Pause,
  Play,
  Type
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ThemeSwitch from "../../../components/buttons/ThemeSwitch";
import UploadMedia from "../../../components/editor/AssetsPanel/AddButtons/UploadMedia";
import AddText from "../../../components/editor/AssetsPanel/tools-section/AddText";
import ExportList from "../../../components/editor/AssetsPanel/tools-section/ExportList";
import MediaList from "../../../components/editor/AssetsPanel/tools-section/MediaList";
import AspectRatioControl from "../../../components/editor/player/AspectRatioControl";
import VideoPlayerContainer from "../../../components/editor/player/VideoPlayerContainer";
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
import LoadingSkeleton from "../components/loading-skeleton";

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
  const handleDimensionChange = useCallback(
    (newWidth: number, newHeight: number) => {
      setWidth(newWidth);
      setHeight(newHeight);
      setWidthInput(String(newWidth));
      setHeightInput(String(newHeight));
    },
    []
  );

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Modern Skeleton Loading Screen */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Main Resizable Layout */}
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Main Editor Area - Resizable with timeline */}
            <ResizablePanel defaultSize={75} minSize={50}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Left Panel - Resizable */}
                <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                  <div className="h-full border-r border-border flex flex-col overflow-hidden">
                    <div className="border-b border-border bg-background shrink-0">
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

                    <div className="flex-1 overflow-hidden">
                      <Tabs
                        value={activeSection}
                        onValueChange={(value) => handleFocus(value as any)}
                      >
                        <TabsContent
                          value="media"
                          className="p-0 m-0 h-full flex flex-col"
                        >
                          <div className="p-6 space-y-4 shrink-0">
                            <UploadMedia />
                          </div>
                          <div className="flex-1 px-6 pb-6 overflow-y-auto min-h-0">
                            <MediaList />
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="text"
                          className="p-6 h-full overflow-y-auto"
                        >
                          <AddText />
                        </TabsContent>

                        <TabsContent
                          value="export"
                          className="p-6 h-full overflow-y-auto"
                        >
                          <ExportList />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Center - Video Preview */}
                <ResizablePanel defaultSize={56} minSize={30}>
                  <div className="h-full flex flex-col bg-muted/30 overflow-hidden">
                    <div className="h-12 border-b border-border bg-muted/30 flex items-center justify-between px-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <AspectRatioControl
                          onDimensionChange={handleDimensionChange}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <ThemeSwitch />
                      </div>
                    </div>

                    {/* Video Container - Takes remaining space */}
                    <div className="flex-1 flex flex-col bg-background min-h-0 overflow-hidden">
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <VideoPlayerContainer
                          playerRef={playerRef}
                          compositionWidth={width}
                          compositionHeight={height}
                        />
                      </div>

                      {/* Player Controls - Fixed at bottom */}
                      <div className="h-14 flex items-center justify-center gap-2 px-4 border-t border-border bg-background shrink-0">
                        <div className="flex items-center gap-1">
                          <MuteButton playerRef={playerRef} />
                        </div>

                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePlayback}
                            className="h-8 px-3"
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-1">
                          <FullscreenButton playerRef={playerRef} />
                        </div>
                      </div>
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right Sidebar - Element Properties */}
                <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                  <div className="h-full border-l border-border overflow-y-auto p-4">
                    {activeElement === "media" && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                          Media Properties
                        </h2>
                        <MediaProperties />
                      </div>
                    )}
                    {activeElement === "text" && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                          Text Properties
                        </h2>
                        <TextProperties />
                      </div>
                    )}
                    {!activeElement && (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Select an element to view properties</p>
                      </div>
                    )}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Timeline Section - Resizable height */}
            <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
              <div className="h-full overflow-hidden">
                <Timeline />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </>
      )}
    </div>
  );
}
