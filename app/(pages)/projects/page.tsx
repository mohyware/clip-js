'use client';

import { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Plus, Video, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addProject, deleteProject, rehydrateProjects, setCurrentProject } from '../../store/slices/projectsSlice';
import { listProjects, storeProject, deleteProject as deleteProjectFromDB } from '../../store';
import { ProjectState } from '../../types';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

    const LoadingSkeleton = () => (
        <div className="fixed inset-0 flex items-center bg-black bg-opacity-50 justify-center z-50">
            <Card className="bg-black bg-opacity-70 border-gray-800">
                <CardContent className="pt-6 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-t-white border-r-white border-opacity-30 border-t-opacity-100 rounded-full animate-spin"></div>
                    <p className="mt-4 text-white text-lg">Loading projects...</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div>
            <div>
                <br />
                <br />
                <h2 className="mx-auto max-w-4xl text-center font-display text-5xl font-medium tracking-tight text-white-900 sm:text-4xl">
                    <span className="inline-block">Projects</span>
                </h2>
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="flex justify-center items-center py-12">
                        <div className="grid py-4 w-2/3 sm:w-1/2 md:w-1/3 lg:w-1/4 grid-cols-1 gap-4 lg:grid-cols-1 lg:gap-5">
                            {/* Add Project Button */}
                            <Card 
                                className="cursor-pointer border border-white border-opacity-10 bg-transparent hover:scale-105 transition-transform [box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset] dark:[box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset]"
                                onClick={() => setIsCreating(true)}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between w-full rounded-full bg-surface-secondary p-2 dark:border-dark-border dark:bg-dark-surface-secondary">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex size-9 items-center justify-center rounded-full bg-surface-secondary">
                                                <Plus className="invert" size={18} />
                                            </div>
                                            <h5 className="text-lg font-medium">Add Project</h5>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* List Projects */}
                            {[...projects]
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map(({ id, projectName, createdAt, lastModified }) => (
                                    <Card 
                                        key={id} 
                                        className="cursor-pointer border border-white border-opacity-10 bg-transparent hover:scale-105 transition-transform [box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset] dark:[box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset]"
                                    >
                                        <CardContent className="pt-6">
                                            <Link href={`/projects/${id}`} onClick={() => dispatch(setCurrentProject(id))} className="block h-full">
                                                <div className="flex items-center justify-between w-full rounded-full bg-surface-secondary p-2 dark:border-dark-border dark:bg-dark-surface-secondary mb-4">
                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                        <div className="flex-shrink-0 flex size-9 items-center justify-center rounded-full bg-surface-secondary">
                                                            <Video className="invert" size={18} />
                                                        </div>
                                                        <h5 className="truncate font-medium text-base sm:text-lg" title={projectName}>
                                                            {projectName}
                                                        </h5>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            handleDeleteProject(id);
                                                        }}
                                                        className="flex-shrink-0 ml-2 text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                        aria-label="Delete project"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-col items-start py-1 gap-1 text-sm">
                                                    <p className="text-pretty text-text-secondary dark:text-dark-text-secondary">
                                                        <Badge variant="outline" className="mr-2">Created</Badge>
                                                        {new Date(createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-pretty text-text-secondary dark:text-dark-text-secondary">
                                                        <Badge variant="outline" className="mr-2">Modified</Badge>
                                                        {new Date(lastModified).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Project Modal */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="bg-black border border-white border-opacity-10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Create New Project</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Enter a name for your new video project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="project-name" className="text-right text-white">
                                Name
                            </Label>
                            <Input
                                id="project-name"
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
                                className="col-span-3 bg-darkSurfacePrimary border-white border-opacity-10 text-white focus:border-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsCreating(false)}
                            className="bg-darkSurfacePrimary border-white border-opacity-10 text-white hover:bg-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateProject}
                            className="bg-white text-black hover:bg-gray-100"
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}