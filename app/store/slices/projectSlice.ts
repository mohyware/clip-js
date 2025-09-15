import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TextElement, MediaFile, ActiveElement, ExportConfig } from '../../types';
import { ProjectState } from '../../types';

export const initialState: ProjectState = {
    id: crypto.randomUUID(),
    projectName: '',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    mediaFiles: [],
    textElements: [],
    currentTime: 0,
    isPlaying: false,
    isMuted: false,
    duration: 0,
    zoomLevel: 1,
    timelineZoom: 100,
    enableMarkerTracking: true,
    activeSection: 'media',
    activeElement: null,
    activeElementIndex: 0,
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    aspectRatio: '16:9',
    history: [],
    future: [],
    exportSettings: {
        resolution: '1080p',
        quality: 'high',
        speed: 'fastest',
        fps: 30,
        format: 'mp4',
        includeSubtitles: false,
    },
};

const calculateTotalDuration = (
    mediaFiles: MediaFile[],
    textElements: TextElement[]
): number => {
    const mediaDurations = mediaFiles.map(v => v.positionEnd);
    const textDurations = textElements.map(v => v.positionEnd);
    return Math.max(0, ...mediaDurations, ...textDurations);
};

const projectStateSlice = createSlice({
    name: 'projectState',
    initialState,
    reducers: {
        setMediaFiles: (state, action: PayloadAction<MediaFile[]>) => {
            state.mediaFiles = action.payload;
            // Calculate duration based on the last video's end time
            state.duration = calculateTotalDuration(state.mediaFiles, state.textElements);
        },
        setProjectName: (state, action: PayloadAction<string>) => {
            state.projectName = action.payload;
        },
        setProjectId: (state, action: PayloadAction<string>) => {
            state.id = action.payload;
        },
        setProjectCreatedAt: (state, action: PayloadAction<string>) => {
            state.createdAt = action.payload;
        },
        setProjectLastModified: (state, action: PayloadAction<string>) => {
            state.lastModified = action.payload;
        },

        setTextElements: (state, action: PayloadAction<TextElement[]>) => {
            state.textElements = action.payload;
            state.duration = calculateTotalDuration(state.mediaFiles, state.textElements);
        },
        setCurrentTime: (state, action: PayloadAction<number>) => {
            state.currentTime = action.payload;
        },
        setIsPlaying: (state, action: PayloadAction<boolean>) => {
            state.isPlaying = action.payload;
        },
        setIsMuted: (state, action: PayloadAction<boolean>) => {
            state.isMuted = action.payload;
        },
        setActiveSection: (state, action: PayloadAction<ActiveElement>) => {
            state.activeSection = action.payload;
        },
        setActiveElement: (state, action: PayloadAction<ActiveElement | null>) => {
            state.activeElement = action.payload;
        },
        setActiveElementIndex: (state, action: PayloadAction<number>) => {
            state.activeElementIndex = action.payload;
        },
        setFilesID: (state, action: PayloadAction<string[]>) => {
            state.filesID = action.payload;
        },
        setExportSettings: (state, action: PayloadAction<ExportConfig>) => {
            state.exportSettings = action.payload;
        },
        setResolution: (state, action: PayloadAction<string>) => {
            state.exportSettings.resolution = action.payload;
        },
        setQuality: (state, action: PayloadAction<string>) => {
            state.exportSettings.quality = action.payload;
        },
        setSpeed: (state, action: PayloadAction<string>) => {
            state.exportSettings.speed = action.payload;
        },
        setFps: (state, action: PayloadAction<number>) => {
            state.exportSettings.fps = action.payload;
        },
        setTimelineZoom: (state, action: PayloadAction<number>) => {
            state.timelineZoom = action.payload;
        },
        setAspectRatio: (state, action: PayloadAction<string>) => {
            state.aspectRatio = action.payload;
            // Update resolution based on aspect ratio
            const aspectRatios = {
                '16:9': { width: 1920, height: 1080 },
                '4:3': { width: 1440, height: 1080 },
                '1:1': { width: 1080, height: 1080 },
                '9:16': { width: 1080, height: 1920 },
                '21:9': { width: 2560, height: 1080 },
            } as const;
            const selectedRatio = aspectRatios[action.payload as keyof typeof aspectRatios];
            if (selectedRatio) {
                state.resolution = selectedRatio;
            }
        },
        setMarkerTrack: (state, action: PayloadAction<boolean>) => {
            state.enableMarkerTracking = action.payload;
        },
        // Special reducer for rehydrating state from IndexedDB
        rehydrate: (state, action: PayloadAction<ProjectState>) => {
            return { ...state, ...action.payload };
        },
        createNewProject: (state) => {
            return { ...initialState };
        },
    },
});

export const {
    setMediaFiles,
    setTextElements,
    setCurrentTime,
    setProjectName,
    setIsPlaying,
    setFilesID,
    setExportSettings,
    setResolution,
    setQuality,
    setSpeed,
    setFps,
    setMarkerTrack,
    setIsMuted,
    setActiveSection,
    setActiveElement,
    setActiveElementIndex,
    setTimelineZoom,
    setAspectRatio,
    rehydrate,
    createNewProject,
} = projectStateSlice.actions;

export default projectStateSlice.reducer; 