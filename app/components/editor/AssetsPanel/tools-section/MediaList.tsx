"use client";

import { listFiles, deleteFile, useAppSelector, storeFile, getFile } from '@/app/store';
import { setMediaFiles, setFilesID } from '@/app/store/slices/projectSlice';
import { MediaFile, UploadedFile } from '@/app/types';
import { useAppDispatch } from '@/app/store';
import AddMedia from '../AddButtons/AddMedia';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, Music, Image as ImageIcon, FileText, Trash2, Grid3X3, List, Upload } from 'lucide-react';
import { categorizeFile } from '@/app/utils/utils';
import { cn } from '@/lib/utils';

export default function MediaList() {
    const { mediaFiles, filesID } = useAppSelector((state) => state.projectState);
    const dispatch = useAppDispatch();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchFiles = async () => {
            try {
                const storedFilesArray: UploadedFile[] = [];

                for (const fileId of filesID || []) {
                    const file = await getFile(fileId);
                    if (file && mounted) {
                        storedFilesArray.push({
                            file: file,
                            id: fileId,
                        });
                    }
                }

                if (mounted) {
                    setFiles(storedFilesArray);
                }
            } catch (error) {
                toast.error("Error fetching files");
                console.error("Error fetching files:", error);
            }
        };

        fetchFiles();

        return () => {
            mounted = false;
        };
    }, [filesID]);

    const handleFiles = async (newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);
        const validFiles = fileArray.filter(file => {
            const isValid = file.type.startsWith('video/') || 
                           file.type.startsWith('audio/') || 
                           file.type.startsWith('image/');
            if (!isValid) {
                toast.error(`${file.name} is not a supported file type`);
            }
            return isValid;
        });

        if (validFiles.length === 0) return;

        setIsUploading(true);
        try {
            const updatedFiles = [...filesID || []];
            for (const file of validFiles) {
                const fileId = crypto.randomUUID();
                await storeFile(file, fileId);
                updatedFiles.push(fileId);
            }
            dispatch(setFilesID(updatedFiles));
            toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} uploaded successfully`);
        } catch (error) {
            toast.error('Error uploading files');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        if (e.dataTransfer.files) {
            await handleFiles(e.dataTransfer.files);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // Only set isDragOver to false if we're leaving the main container
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    }, []);

    const onDeleteMedia = async (id: string) => {
        const onUpdateMedia = mediaFiles.filter(f => f.fileId !== id);
        dispatch(setMediaFiles(onUpdateMedia));
        dispatch(setFilesID(filesID?.filter(f => f !== id) || []));
        await deleteFile(id);
        toast.success("Media deleted successfully");
    };

    const getFileIcon = (fileType: string) => {
        const type = categorizeFile(fileType);
        switch (type) {
            case 'video':
                return <Video className="h-5 w-5 text-primary" />;
            case 'audio':
                return <Music className="h-5 w-5 text-primary" />;
            case 'image':
                return <ImageIcon className="h-5 w-5 text-primary" />;
            default:
                return <FileText className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getFileTypeColor = (fileType: string) => {
        const type = categorizeFile(fileType);
        switch (type) {
            case 'video':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'audio':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'image':
                return 'bg-primary/10 text-primary border-primary/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filterFilesByType = (files: UploadedFile[], type: string) => {
        if (type === 'all') return files;
        return files.filter(file => categorizeFile(file.file.type) === type);
    };

    const getTabCounts = () => {
        const counts = {
            all: files.length,
            video: files.filter(f => categorizeFile(f.file.type) === 'video').length,
            image: files.filter(f => categorizeFile(f.file.type) === 'image').length,
            audio: files.filter(f => categorizeFile(f.file.type) === 'audio').length,
        };
        return counts;
    };

    const renderFileItem = (mediaFile: UploadedFile) => {
        if (viewMode === 'grid') {
            return (
                <div key={mediaFile.id} className="group relative border border-border rounded-lg bg-card hover:bg-accent/50 transition-all duration-200 p-3">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            {getFileIcon(mediaFile.file.type)}
                        </div>
                        <div className="text-center min-w-0 w-full">
                            <h4 className="font-medium text-xs truncate" title={mediaFile.file.name}>
                                {mediaFile.file.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatFileSize(mediaFile.file.size)}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AddMedia fileId={mediaFile.id} />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteMedia(mediaFile.id)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div key={mediaFile.id} className="group relative border border-border rounded-lg bg-card hover:bg-accent/50 transition-all duration-200">
                <div className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                {getFileIcon(mediaFile.file.type)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate" title={mediaFile.file.name}>
                                    {mediaFile.file.name}
                                </h4>
                                <Badge variant="outline" className={`text-xs ${getFileTypeColor(mediaFile.file.type)}`}>
                                    {categorizeFile(mediaFile.file.type)}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(mediaFile.file.size)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <AddMedia fileId={mediaFile.id} />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteMedia(mediaFile.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderEmptyState = (type: string) => (
        <div className="text-center py-12 px-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                {type === 'video' && <Video className="h-8 w-8 text-primary" />}
                {type === 'audio' && <Music className="h-8 w-8 text-primary" />}
                {type === 'image' && <ImageIcon className="h-8 w-8 text-primary" />}
                {type === 'all' && <Upload className="h-8 w-8 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
                No {type === 'all' ? 'media' : type} files
            </h3>
            <p className="text-muted-foreground mb-4">
                {type === 'all' 
                    ? 'Upload your first media file to get started.' 
                    : `Upload your first ${type} file to get started.`
                }
            </p>
        </div>
    );

    const counts = getTabCounts();

    return (
        <div 
            className={cn(
                "h-full relative transition-colors duration-200",
                isDragOver && "bg-primary/5"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <div className="space-y-4">
                {/* Header with View Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all" className="flex items-center gap-1">
                            All
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {counts.all}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="video" className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Video
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {counts.video}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="image" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Image
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {counts.image}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="audio" className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            Audio
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {counts.audio}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Content with Scrollable Area */}
                    <ScrollArea className="h-[400px]">
                        <TabsContent value="all" className="mt-4">
                            {files.length === 0 ? renderEmptyState('all') : (
                                <div className={cn(
                                    "gap-3",
                                    viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3" : "space-y-2"
                                )}>
                                    {files.map(renderFileItem)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="video" className="mt-4">
                            {counts.video === 0 ? renderEmptyState('video') : (
                                <div className={cn(
                                    "gap-3",
                                    viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3" : "space-y-2"
                                )}>
                                    {filterFilesByType(files, 'video').map(renderFileItem)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="image" className="mt-4">
                            {counts.image === 0 ? renderEmptyState('image') : (
                                <div className={cn(
                                    "gap-3",
                                    viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3" : "space-y-2"
                                )}>
                                    {filterFilesByType(files, 'image').map(renderFileItem)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="audio" className="mt-4">
                            {counts.audio === 0 ? renderEmptyState('audio') : (
                                <div className={cn(
                                    "gap-3",
                                    viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3" : "space-y-2"
                                )}>
                                    {filterFilesByType(files, 'audio').map(renderFileItem)}
                                </div>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </div>
        </div>
    );
}