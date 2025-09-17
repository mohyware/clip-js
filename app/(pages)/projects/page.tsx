'use client';

import { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import { Plus, Video, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addProject, deleteProject, rehydrateProjects, setCurrentProject } from '../../store/slices/projectsSlice';
import { listProjects, storeProject, deleteProject as deleteProjectFromDB } from '../../store';
import { ProjectState } from '../../types';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Projects() {
    const dispatch = useAppDispatch();
    const { projects, currentProjectId } = useAppSelector((state) => state.projects);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-lg">
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );

    // Filter projects based on search query
    const filteredProjects = projects.filter(project => 
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return formatDate(dateString);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground">Projects</h1>
                            <p className="text-muted-foreground mt-1">
                                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                            </p>
                        </div>
                        <Button 
                            onClick={() => setIsCreating(true)}
                            className="font-medium"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="mt-6 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : filteredProjects.length === 0 && searchQuery ? (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                        <p className="text-muted-foreground">Try adjusting your search to find what you're looking for.</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-6">Get started by creating your first video project.</p>
                        <Button 
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...filteredProjects]
                            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
                            .map((project) => (
                                <div key={project.id} className="group relative">
                                    <Link 
                                        href={`/projects/${project.id}`} 
                                        onClick={() => dispatch(setCurrentProject(project.id))}
                                        className="block"
                                    >
                                        <div className="p-6 border border-border bg-card rounded-lg hover:border-border/80 hover:shadow-sm transition-all duration-200 cursor-pointer">
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-medium text-card-foreground truncate text-lg">
                                                        {project.projectName}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        {getTimeAgo(project.lastModified)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="w-8 h-8"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteProject(project.id);
                                                    }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Enter a name for your new video project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">
                                Project Name
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
                                placeholder="My Video Project"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsCreating(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateProject}
                            disabled={!newProjectName.trim()}
                        >
                            Create Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}