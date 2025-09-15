"use client";

import { useAppSelector } from '../../../store';
import { setActiveElement, setTextElements } from '../../../store/slices/projectSlice';
import { TextElement } from '../../../types';
import { useAppDispatch } from '../../../store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Type, Clock, Move, Palette, Settings, Layers } from 'lucide-react';

export default function TextProperties() {
    const { textElements, activeElementIndex } = useAppSelector((state) => state.projectState);
    const textElement = textElements[activeElementIndex];
    const dispatch = useAppDispatch();

    const onUpdateText = (id: string, updates: Partial<TextElement>) => {
        dispatch(setTextElements(textElements.map(text =>
            text.id === id ? { ...text, ...updates } : text
        )));
    };

    if (!textElement) {
        return (
            <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Type className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Text Element Selected</h3>
                <p className="text-muted-foreground">Select a text element from the timeline to edit its properties.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Text Properties</h2>
                </div>
                <Badge variant="outline" className="text-xs">
                    Element {activeElementIndex + 1}
                </Badge>
            </div>

            <div className="space-y-6">
                {/* Text Content Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Content</Label>
                    </div>
                    <Textarea
                        value={textElement.text}
                        onChange={(e) => onUpdateText(textElement.id, { text: e.target.value })}
                        placeholder="Enter your text here..."
                        className="min-h-[80px] resize-none"
                    />
                </div>

                <Separator />

                {/* Timing Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Timing</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="start-time" className="text-xs text-muted-foreground">Start Time (s)</Label>
                            <Input
                                id="start-time"
                                type="number"
                                min={0}
                                step={0.1}
                                value={textElement.positionStart}
                                readOnly
                                className="bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground">Use timeline to adjust</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-time" className="text-xs text-muted-foreground">End Time (s)</Label>
                            <Input
                                id="end-time"
                                type="number"
                                min={textElement.positionStart}
                                step={0.1}
                                value={textElement.positionEnd}
                                readOnly
                                className="bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground">Use timeline to adjust</p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Position Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Move className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Position</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="x-position" className="text-xs text-muted-foreground">X Position (px)</Label>
                            <Input
                                id="x-position"
                                type="number"
                                step={10}
                                value={textElement.x || 0}
                                onChange={(e) => onUpdateText(textElement.id, { x: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="y-position" className="text-xs text-muted-foreground">Y Position (px)</Label>
                            <Input
                                id="y-position"
                                type="number"
                                step={10}
                                value={textElement.y || 0}
                                onChange={(e) => onUpdateText(textElement.id, { y: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Typography Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Typography</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="font-family" className="text-xs text-muted-foreground">Font Family</Label>
                            <Select
                                value={textElement.font || "Arial"}
                                onValueChange={(value) => onUpdateText(textElement.id, { font: value })}
                            >
                                <SelectTrigger id="font-family">
                                    <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Inter">Inter</SelectItem>
                                    <SelectItem value="Lato">Lato</SelectItem>
                                    <SelectItem value="Roboto">Roboto</SelectItem>
                                    <SelectItem value="OpenSans">Open Sans</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="font-size" className="text-xs text-muted-foreground">Font Size (px)</Label>
                            <Input
                                id="font-size"
                                type="number"
                                min={8}
                                max={500}
                                step={5}
                                value={textElement.fontSize || 24}
                                onChange={(e) => onUpdateText(textElement.id, { fontSize: Number(e.target.value) })}
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
                        {/* Color Picker */}
                        <div className="space-y-2">
                            <Label htmlFor="text-color" className="text-xs text-muted-foreground">Text Color</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="text-color"
                                    type="color"
                                    value={textElement.color || '#ffffff'}
                                    onChange={(e) => onUpdateText(textElement.id, { color: e.target.value })}
                                    className="w-12 h-10 rounded-md border border-input bg-background cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={textElement.color || '#ffffff'}
                                    onChange={(e) => onUpdateText(textElement.id, { color: e.target.value })}
                                    className="flex-1 font-mono text-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Opacity Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="opacity" className="text-xs text-muted-foreground">Opacity</Label>
                                <Badge variant="outline" className="text-xs">
                                    {textElement.opacity}%
                                </Badge>
                            </div>
                            <Slider
                                id="opacity"
                                min={0}
                                max={100}
                                step={1}
                                value={[textElement.opacity || 100]}
                                onValueChange={(value) => onUpdateText(textElement.id, { opacity: value[0] })}
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
                            value={textElement.zIndex || 0}
                            onChange={(e) => onUpdateText(textElement.id, { zIndex: Number(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">Higher values appear on top</p>
                    </div>
                </div>
            </div>
        </div>
    );
}