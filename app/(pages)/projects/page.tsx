'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Video,
    Trash2,
    Search,
    MoreHorizontal,
    LayoutGrid,
    List,
    ArrowUpDown,
    CalendarClock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
    addProject,
    deleteProject,
    rehydrateProjects,
    setCurrentProject,
} from '../../store/slices/projectsSlice';
import {
    listProjects,
    storeProject,
    deleteProject as deleteProjectFromDB,
} from '../../store';
import { ProjectState } from '../../types';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
export default function Projects() {
    const dispatch = useAppDispatch();
    const { projects } = useAppSelector((state) => state.projects);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'modified' | 'created' | 'name'>('modified');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [deleteTarget, setDeleteTarget] = useState<ProjectState | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true);
            try {
                const stored = await listProjects();
                dispatch(rehydrateProjects(stored));
            } catch (error) {
                console.error('Error loading projects:', error);
                toast.error('Failed to load projects');
            } finally {
                setIsLoading(false);
            }
        };
        loadProjects();
    }, [dispatch]);

    useEffect(() => {
        if (isCreating && inputRef.current) inputRef.current.focus();
    }, [isCreating]);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        // New project baseline (kept in sync with ProjectState)
        const now = new Date().toISOString();
        const newProject: ProjectState = {
            id: crypto.randomUUID(),
            projectName: newProjectName.trim(),
            createdAt: now,
            lastModified: now,
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
        toast.success('Project created');
    };

    const confirmDeleteProject = async (projectId: string) => {
        await deleteProjectFromDB(projectId);
        dispatch(deleteProject(projectId));
        const storedProjects = await listProjects();
        dispatch(rehydrateProjects(storedProjects));
        toast.success('Project deleted');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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

    const visibleProjects = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        let list = projects.filter((p) =>
            p.projectName.toLowerCase().includes(query)
        );

        list = list.sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'name') {
                cmp = a.projectName.localeCompare(b.projectName);
            } else if (sortBy === 'created') {
                cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else {
                cmp =
                    new Date(a.lastModified).getTime() -
                    new Date(b.lastModified).getTime();
            }
            return sortOrder === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [projects, searchQuery, sortBy, sortOrder]);

    const countText = `${visibleProjects.length} ${visibleProjects.length === 1 ? 'project' : 'projects'}`;

    const LoadingSkeleton = () => (
        <div
            className={
                view === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-2'
            }
        >
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className={
                        view === 'grid'
                            ? 'p-6 border border-border bg-card rounded-lg'
                            : 'flex items-center justify-between border border-border bg-card rounded-md px-4 py-3'
                    }
                >
                    <div className={view === 'grid' ? 'space-y-3 w-full' : 'flex items-center gap-4 w-full'}>
                        <Skeleton className={view === 'grid' ? 'h-5 w-3/4' : 'h-5 w-56'} />
                        <Skeleton className={view === 'grid' ? 'h-4 w-1/2' : 'h-4 w-32'} />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h1 className="text-3xl font-semibold text-foreground">Projects</h1>
                                <p className="text-muted-foreground mt-1">{countText}</p>
                            </div>
                            <Button onClick={() => setIsCreating(true)} className="font-medium">
                                <Plus className="w-4 h-4 mr-2" /> New Project
                            </Button>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <div className="relative md:flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                    aria-label="Search projects"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Select
                                    value={`${sortBy}:${sortOrder}`}
                                    onValueChange={(val) => {
                                        const [by, order] = val.split(':') as [
                                            'name' | 'created' | 'modified',
                                            'asc' | 'desc'
                                        ];
                                        setSortBy(by);
                                        setSortOrder(order);
                                    }}
                                >
                                    <SelectTrigger className="w-[210px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value="modified:desc">Recently edited</SelectItem>
                                        <SelectItem value="created:desc">Recently created</SelectItem>
                                        <SelectItem value="name:asc">Name (A–Z)</SelectItem>
                                        <SelectItem value="name:desc">Name (Z–A)</SelectItem>
                                        <SelectItem value="modified:asc">Oldest edited</SelectItem>
                                        <SelectItem value="created:asc">Oldest created</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Separator orientation="vertical" className="h-9" />

                                <ToggleGroup
                                    type="single"
                                    value={view}
                                    onValueChange={(v) => v && setView(v as 'grid' | 'list')}
                                    aria-label="Toggle view"
                                >
                                    <ToggleGroupItem value="grid" aria-label="Grid view">
                                        <LayoutGrid className="w-4 h-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="list" aria-label="List view">
                                        <List className="w-4 h-4" />
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : visibleProjects.length === 0 && searchQuery ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                        <p className="text-muted-foreground">Try a different search term.</p>
                    </div>
                ) : visibleProjects.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-6">Create your first video project to get started.</p>
                        <Button onClick={() => setIsCreating(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Create Project
                        </Button>
                    </div>
                ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visibleProjects.map((project) => (
                            <div key={project.id} className="group relative">
                                <Link
                                    href={`/projects/${project.id}`}
                                    onClick={() => dispatch(setCurrentProject(project.id))}
                                    className="block"
                                >
                                    <div className="p-5 border border-border bg-card rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-card-foreground truncate text-lg">
                                                    {project.projectName}
                                                </h3>
                                                <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
                                                    <CalendarClock className="w-4 h-4" />
                                                    <span>Edited {getTimeAgo(project.lastModified)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="w-8 h-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setDeleteTarget(project);
                                                }}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border border-border rounded-md divide-y divide-border">
                        {visibleProjects.map((project) => (
                            <div key={project.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/50">
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/projects/${project.id}`}
                                        onClick={() => dispatch(setCurrentProject(project.id))}
                                        className="flex items-center gap-3 min-w-0"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-foreground truncate">
                                                {project.projectName}
                                            </span>
                                            <span className="text-sm text-muted-foreground truncate">
                                                Edited {getTimeAgo(project.lastModified)} • {project.mediaFiles.length} assets • {project.fps} fps
                                            </span>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button asChild variant="secondary" size="sm">
                                        <Link href={`/projects/${project.id}`} onClick={() => dispatch(setCurrentProject(project.id))}>Open</Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="w-8 h-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setDeleteTarget(project);
                                                }}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
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
                        <DialogTitle>Create new project</DialogTitle>
                        <DialogDescription>Give your video project a clear, memorable name.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project name</Label>
                            <Input
                                id="project-name"
                                ref={inputRef}
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateProject();
                                    if (e.key === 'Escape') setIsCreating(false);
                                }}
                                placeholder="My Video Project"
                            />
                            <p className="text-xs text-muted-foreground">You can rename projects anytime from within the editor.</p>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button variant="outline" onClick={() => setIsCreating(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                            Create Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All media references and timeline data for "{deleteTarget?.projectName}" will be permanently removed from this device.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                                if (deleteTarget) await confirmDeleteProject(deleteTarget.id);
                                setDeleteTarget(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}