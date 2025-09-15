"use client";

import { getFile, useAppDispatch, useAppSelector } from "../../../../store";
import { setMediaFiles } from "../../../../store/slices/projectSlice";
import { storeFile } from "../../../../store";
import { categorizeFile } from "../../../../utils/utils";
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AddMedia({ fileId }: { fileId: string }) {
    const { mediaFiles } = useAppSelector((state) => state.projectState);
    const dispatch = useAppDispatch();

    const handleFileChange = async () => {
        const updatedMedia = [...mediaFiles];

        const file = await getFile(fileId);
        const mediaId = crypto.randomUUID();

        if (fileId) {
            const relevantClips = mediaFiles.filter(clip => clip.type === categorizeFile(file.type));
            const lastEnd = relevantClips.length > 0
                ? Math.max(...relevantClips.map(f => f.positionEnd))
                : 0;

            updatedMedia.push({
                id: mediaId,
                fileName: file.name,
                fileId: fileId,
                startTime: 0,
                endTime: 30,
                src: URL.createObjectURL(file),
                positionStart: lastEnd,
                positionEnd: lastEnd + 30,
                includeInMerge: true,
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
                rotation: 0,
                opacity: 100,
                crop: { x: 0, y: 0, width: 1920, height: 1080 },
                playbackSpeed: 1,
                volume: 100,
                type: categorizeFile(file.type),
                zIndex: 0,
            });
        }
        dispatch(setMediaFiles(updatedMedia));
        toast.success('Media added to timeline');
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFileChange}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add to timeline</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
