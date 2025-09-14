"use client";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { openDB } from "idb";
import projectStateReducer from "./slices/projectSlice";
import projectsReducer from "./slices/projectsSlice";
import toast from "react-hot-toast";

// Create IndexedDB database for files and projects
const setupDB = async () => {
  if (typeof window === "undefined") return null;
  const db = await openDB("timeline-files", 1, {
    upgrade(db) {
      db.createObjectStore("files", { keyPath: "id" });
      db.createObjectStore("projects", { keyPath: "id" });
    },
  });
  return db;
};

// Load state from localStorage
export const loadState = () => {
  if (typeof window === "undefined") return undefined;
  try {
    const serializedState = localStorage.getItem("timeline-state");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    toast.error("Error loading state from localStorage");
    console.error("Error loading state from localStorage:", error);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state: any) => {
  if (typeof window === "undefined") return;
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("timeline-state", serializedState);
  } catch (error) {
    console.error("Error saving state to localStorage:", error);
  }
};

// File storage functions
export const storeFile = async (file: File, fileId: string) => {
  if (typeof window === "undefined") return null;
  try {
    const db = await setupDB();
    if (!db) return null;

    const fileData = {
      id: fileId,
      file: file,
    };

    await db.put("files", fileData);
    return fileId;
  } catch (error) {
    toast.error("Error storing file");
    console.error("Error storing file:", error);
    return null;
  }
};

export const getFile = async (fileId: string) => {
  if (typeof window === "undefined") return null;
  try {
    const db = await setupDB();
    if (!db) return null;

    const fileData = await db.get("files", fileId);
    if (!fileData) return null;

    return fileData.file;
  } catch (error) {
    toast.error("Error retrieving file");
    console.error("Error retrieving file:", error);
    return null;
  }
};

export const deleteFile = async (fileId: string) => {
  if (typeof window === "undefined") return;
  try {
    const db = await setupDB();
    if (!db) return;
    await db.delete("files", fileId);
  } catch (error) {
    toast.error("Error deleting file");
    console.error("Error deleting file:", error);
  }
};

export const listFiles = async () => {
  if (typeof window === "undefined") return [];
  try {
    const db = await setupDB();
    if (!db) return [];
    return await db.getAll("files");
  } catch (error) {
    toast.error("Error listing files");
    console.error("Error listing files:", error);
    return [];
  }
};

// Project storage functions
export const storeProject = async (project: any) => {
  if (typeof window === "undefined") return null;
  try {
    const db = await setupDB();

    if (!db) return null;
    if (!project.id || !project.projectName) {
      return null;
    }

    await db.put("projects", project);

    return project.id;
  } catch (error) {
    toast.error("Error storing project");
    console.error("Error storing project:", error);
    return null;
  }
};

export const getProject = async (projectId: string) => {
  if (typeof window === "undefined") return null;
  try {
    const db = await setupDB();
    if (!db) return null;
    return await db.get("projects", projectId);
  } catch (error) {
    toast.error("Error retrieving project");
    console.error("Error retrieving project:", error);
    return null;
  }
};

export const deleteProject = async (projectId: string) => {
  if (typeof window === "undefined") return;
  try {
    const db = await setupDB();
    if (!db) return;
    await db.delete("projects", projectId);
  } catch (error) {
    toast.error("Error deleting project");
    console.error("Error deleting project:", error);
  }
};

export const listProjects = async () => {
  if (typeof window === "undefined") return [];
  try {
    const db = await setupDB();
    if (!db) return [];
    return await db.getAll("projects");
  } catch (error) {
    console.error("Error listing projects:", error);
    return [];
  }
};

export const store = configureStore({
  reducer: {
    projectState: projectStateReducer,
    projects: projectsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// TODO: remove old state (localStorage we use indexedDB now) that is not used anymore

// Load persisted state from localStorage
// const persistedState = loadState();
// if (persistedState) {
//     store.dispatch({
//         type: 'REPLACE_STATE',
//         payload: persistedState
//     });
// }

// TODO: for some reason state get saved to localStorage twice when its none cause loss of old state i shall find better way to do this later
// Subscribe to store changes to save to localStorage
// if (typeof window !== 'undefined') {
//     let isInitial = 2;
//     store.subscribe(() => {
//         if (isInitial) {
//             isInitial -= 1;
//             return;
//         }

//         const state = store.getState();
//         saveState(state);
//     });
// }

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
