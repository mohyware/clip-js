"use client";
import { useEffect, useRef, useState } from "react";
import {
  getFile,
  storeProject,
  useAppDispatch,
  useAppSelector,
} from "../../../store";
import { getProject } from "../../../store";
import {
  setCurrentProject,
  updateProject,
} from "../../../store/slices/projectsSlice";
import { rehydrate, setMediaFiles } from "../../../store/slices/projectSlice";
import { setActiveSection } from "../../../store/slices/projectSlice";
import AddText from "../../../components/editor/AssetsPanel/tools-section/AddText";
import UploadMedia from "../../../components/editor/AssetsPanel/AddButtons/UploadMedia";
import MediaList from "../../../components/editor/AssetsPanel/tools-section/MediaList";
import { useRouter } from "next/navigation";
import HomeButton from "@/app/components/editor/AssetsPanel/SidebarButtons/HomeButton";
import ShortcutsButton from "@/app/components/editor/AssetsPanel/SidebarButtons/ShortcutsButton";
import MediaProperties from "../../../components/editor/PropertiesSection/MediaProperties";
import TextProperties from "../../../components/editor/PropertiesSection/TextProperties";
import { Timeline } from "../../../components/editor/timeline/Timline";
import { PreviewPlayer } from "../../../components/editor/player/remotion/Player";
import { MediaFile } from "@/app/types";
import ExportList from "../../../components/editor/AssetsPanel/tools-section/ExportList";
import Image from "next/image";
import {
  Video,
  Music,
  ImageIcon,
  Type,
  FolderOpen,
  Download,
} from "lucide-react";
import ProjectName from "../../../components/editor/player/ProjectName";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function Project({ params }: { params: { id: string } }) {
  const { id } = params;
  const dispatch = useAppDispatch();
  const projectState = useAppSelector((state) => state.projectState);
  const { currentProjectId } = useAppSelector((state) => state.projects);
  const [isLoading, setIsLoading] = useState(true);

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

              <TabsContent value="export" className="p-4 px-6 m-0">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Export Settings</h2>
                  <ExportList />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Video Preview */}
          <div className="flex items-center justify-center flex-col flex-[1] overflow-hidden bg-muted/30">
            <ProjectName />
            <PreviewPlayer />
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
