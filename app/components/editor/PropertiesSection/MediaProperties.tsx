"use client";

import { useAppSelector } from '../../../store';
import { setActiveElement, setMediaFiles, setTextElements } from '../../../store/slices/projectSlice';
import { MediaFile } from '../../../types';
import { useAppDispatch } from '../../../store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Video, Clock, Move, Palette, Settings, Layers, Volume2 } from 'lucide-react';

export default function MediaProperties() {
    const { mediaFiles, activeElementIndex } = useAppSelector((state) => state.projectState);
    const mediaFile = mediaFiles[activeElementIndex];
    const dispatch = useAppDispatch();
    const onUpdateMedia = (id: string, updates: Partial<MediaFile>) => {
        dispatch(setMediaFiles(mediaFiles.map(media =>
            media.id === id ? { ...media, ...updates } : media
        )));
    };

    if (!mediaFile) {
        return (
            <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Media Element Selected</h3>
                <p className="text-muted-foreground">Select a media element from the timeline to edit its properties.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Media Properties</h2>
                </div>
                <Badge variant="outline" className="text-xs">
                    Element {activeElementIndex + 1}
                </Badge>
            </div>

            <div className="space-y-6">
                {/* Source Video Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Source Video</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="source-start" className="text-xs text-muted-foreground">Start Time (s)</Label>
                            <Input
                                id="source-start"
                                type="number"
                                min={0}
                                step={0.1}
                                value={mediaFile.startTime}
                                readOnly
                                className="bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground">Use timeline to trim</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="source-end" className="text-xs text-muted-foreground">End Time (s)</Label>
                            <Input
                                id="source-end"
                                type="number"
                                min={mediaFile.startTime}
                                step={0.1}
                                value={mediaFile.endTime}
                                readOnly
                                className="bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground">Use timeline to trim</p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Timing Position Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Timeline Position</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="position-start" className="text-xs text-muted-foreground">Start Time (s)</Label>
                            <Input
                                id="position-start"
                                type="number"
                                min={0}
                                step={0.1}
                                value={mediaFile.positionStart}
                                readOnly
                                className="bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground">Use timeline to adjust</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position-end" className="text-xs text-muted-foreground">End Time (s)</Label>
                            <Input
                                id="position-end"
                                type="number"
                                min={mediaFile.positionStart}
                                step={0.1}
                                value={mediaFile.positionEnd}
                                readOnly
                                className="bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground">Use timeline to adjust</p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Visual Properties Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Move className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Position & Size</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="x-position" className="text-xs text-muted-foreground">X Position (px)</Label>
                            <Input
                                id="x-position"
                                type="number"
                                step={10}
                                value={mediaFile.x || 0}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { x: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="y-position" className="text-xs text-muted-foreground">Y Position (px)</Label>
                            <Input
                                id="y-position"
                                type="number"
                                step={10}
                                value={mediaFile.y || 0}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { y: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="width" className="text-xs text-muted-foreground">Width (px)</Label>
                            <Input
                                id="width"
                                type="number"
                                step={10}
                                min={1}
                                value={mediaFile.width || 100}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { width: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height" className="text-xs text-muted-foreground">Height (px)</Label>
                            <Input
                                id="height"
                                type="number"
                                step={10}
                                min={1}
                                value={mediaFile.height || 100}
                                onChange={(e) => onUpdateMedia(mediaFile.id, { height: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Style Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Style</Label>
                    </div>
                    <div className="space-y-4">
                        {/* Opacity Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="opacity" className="text-xs text-muted-foreground">Opacity</Label>
                                <Badge variant="outline" className="text-xs">
                                    {mediaFile.opacity}%
                                </Badge>
                            </div>
                            <Slider
                                id="opacity"
                                min={0}
                                max={100}
                                step={1}
                                value={[mediaFile.opacity || 100]}
                                onValueChange={(value) => onUpdateMedia(mediaFile.id, { opacity: value[0] })}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Layer Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Layer</Label>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="z-index" className="text-xs text-muted-foreground">Z-Index (Layer Order)</Label>
                        <Input
                            id="z-index"
                            type="number"
                            min={0}
                            value={mediaFile.zIndex || 0}
                            onChange={(e) => onUpdateMedia(mediaFile.id, { zIndex: Number(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">Higher values appear on top</p>
                    </div>
                </div>

                {/* Audio Properties Section */}
                {(mediaFile.type === "video" || mediaFile.type === "audio") && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Audio</Label>
                            </div>
                            <div className="space-y-4">
                                {/* Volume Slider */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="volume" className="text-xs text-muted-foreground">Volume</Label>
                                        <Badge variant="outline" className="text-xs">
                                            {mediaFile.volume}%
                                        </Badge>
                                    </div>
                                    <Slider
                                        id="volume"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={[mediaFile.volume || 100]}
                                        onValueChange={(value) => onUpdateMedia(mediaFile.id, { volume: value[0] })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}