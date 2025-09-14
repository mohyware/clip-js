'use client';

import { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Plus, Video } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addProject, deleteProject, rehydrateProjects, setCurrentProject } from '../../store/slices/projectsSlice';
import { listProjects, storeProject, deleteProject as deleteProjectFromDB } from '../../store';
import { ProjectState } from '../../types';
import { toast } from 'react-hot-toast';
export default function Projects() {
    const dispatch = useAppDispatch();
    const { projects, currentProjectId } = useAppSelector((state) => state.projects);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true);
            try {
                const storedProjects = await listProjects();
                dispatch(rehydrateProjects(storedProjects));
            } catch (error) {
                toast.error('Failed to load projects');
                console.error('Error loading projects:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProjects();
    }, [dispatch]);

    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        // TODO: use reducer not this to create new project
        const newProject: ProjectState = {
            id: crypto.randomUUID(),
            projectName: newProjectName,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            mediaFiles: [],
            textElements: [],
            currentTime: 0,
            isPlaying: false,
            isMuted: false,
            duration: 0,
            activeSection: 'media',
            activeElement: 'text',
            activeElementIndex: 0,
            filesID: [],
            zoomLevel: 1,
            timelineZoom: 100,
            enableMarkerTracking: true,
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

        await storeProject(newProject);
        dispatch(addProject(newProject));
        setNewProjectName('');
        setIsCreating(false);
        toast.success('Project created successfully');
    };

    const handleDeleteProject = async (projectId: string) => {
        await deleteProjectFromDB(projectId);
        dispatch(deleteProject(projectId));
        const storedProjects = await listProjects();
        dispatch(rehydrateProjects(storedProjects));
        toast.success('Project deleted successfully');
    };

    return (
        <div>
            <div>
                <br />
                <br />
                <h2 className="mx-auto max-w-4xl text-center font-display text-5xl font-medium tracking-tight text-white-900 sm:text-4xl">
                    <span className="inline-block">Projects</span>
                </h2>
                {isLoading ? (
                    <div className="fixed inset-0 flex items-center bg-black bg-opacity-50 justify-center z-50">
                        <div className="bg-black bg-opacity-70 p-6 rounded-lg flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-t-white border-r-white border-opacity-30 border-t-opacity-100 rounded-full animate-spin"></div>
                            <p className="mt-4 text-white text-lg">Loading projects...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center py-12">
                        <div className="grid py-4 w-2/3 sm:w-1/2 md:w-1/3 lg:w-1/4 grid-cols-1 gap-4 lg:grid-cols-1 lg:gap-5">
                            {/* Add Project Button */}
                            <button onClick={() => setIsCreating(true)} className="group">
                                <div
                                    className="flex flex-col gap-4 rounded-lg border border-white border-opacity-10 shadow-md p-4 transition-transform transform group-hover:scale-105 group-hover:border-opacity-10 group-hover:shadow-lg [box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset] dark:[box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset]"
                                >
                                    <figure className="flex items-center justify-between w-full rounded-full bg-surface-secondary p-2 dark:border-dark-border dark:bg-dark-surface-secondary">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex size-9 items-center justify-center rounded-full bg-surface-secondary">
                                                <Plus className="invert" size={18} />
                                            </div>
                                            <h5 className="text-lg font-medium">Add Project</h5>
                                        </div>
                                    </figure>
                                </div>
                            </button>

                            {/* List Projects */}
                            {[...projects]
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map(({ id, projectName, createdAt, lastModified }) => (
                                    <div key={id} className="">
                                        <Link href={`/projects/${id}`} onClick={() => dispatch(setCurrentProject(id))} className="group block h-full">
                                            <div
                                                className="flex flex-col gap-4 rounded-lg border border-white border-opacity-10 shadow-md p-4 transition-transform transform group-hover:scale-105 group-hover:border-opacity-10 group-hover:shadow-lg [box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset] dark:[box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset]"
                                            >
                                                <figure className="flex items-center justify-between w-full rounded-full bg-surface-secondary p-2 dark:border-dark-border dark:bg-dark-surface-secondary">
                                                    {/*  Project Name */}
                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                        <div className="flex-shrink-0 flex size-9 items-center justify-center rounded-full bg-surface-secondary">
                                                            <Video className="invert" size={18} />
                                                        </div>
                                                        <h5 className="truncate font-medium text-base sm:text-lg" title={projectName}>
                                                            {projectName}
                                                        </h5>
                                                    </div>
                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            handleDeleteProject(id);
                                                        }}
                                                        className="flex-shrink-0 ml-2 text-red-500 hover:text-red-600 transition-colors"
                                                        aria-label="Delete project"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </figure>
                                                <div className="flex flex-col items-start py-1 gap-1 text-sm">
                                                    <p className="text-pretty text-text-secondary dark:text-dark-text-secondary">
                                                        <span className="font-medium">Created:</span> {new Date(createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-pretty text-text-secondary dark:text-dark-text-secondary">
                                                        <span className="font-medium">Last Modified:</span> {new Date(lastModified).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Project Modal */}
            <div className="container mx-auto px-4 py-8">
                {isCreating && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-black border border-white border-opacity-10 p-6 rounded-lg w-96">
                            <h3 className="text-xl font-bold mb-4 text-white">Create New Project</h3>
                            <input
                                type="text"
                                ref={inputRef}
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleCreateProject();
                                    } else if (e.key === "Escape") {
                                        setIsCreating(false);
                                    }
                                }}
                                placeholder="Project Name"
                                className="w-full p-2 mb-4 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md hover:bg-[#383838] text-white rounded "
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateProject}
                                    className="px-4 py-2 bg-white text-black hover:bg-[#ccc] rounded"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
}