"use client";

import { useState } from "react";
import { TextElement } from "../../../../types";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  setResolution,
  setTextElements,
} from "../../../../store/slices/projectSlice";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Type, Clock, Move, Palette, Layers, Settings } from "lucide-react";

export default function AddTextButton() {
  const [textConfig, setTextConfig] = useState<Partial<TextElement>>({
    text: "Example",
    positionStart: 0,
    positionEnd: 10,
    x: 600,
    y: 500,
    fontSize: 200,
    color: "#ff0000",
    backgroundColor: "transparent",
    align: "center",
    zIndex: 0,
    opacity: 100,
    rotation: 0,
    animation: "none",
  });
  const { textElements } = useAppSelector((state) => state.projectState);
  const dispatch = useAppDispatch();

  const onAddText = (textElement: TextElement) => {
    dispatch(setTextElements([...textElements, textElement]));
  };

  const handleAddText = () => {
    const lastEnd =
      textElements.length > 0
        ? Math.max(...textElements.map((f) => f.positionEnd))
        : 0;

    const newTextElement: TextElement = {
      id: crypto.randomUUID(),
      text: textConfig.text || "",
      positionStart: lastEnd || 0,
      positionEnd: lastEnd + 10 || 10,
      x: textConfig.x || 0,
      y: textConfig.y || 0,
      width: textConfig.width,
      height: textConfig.height,
      font: textConfig.font || "Arial",
      fontSize: textConfig.fontSize || 24,
      color: textConfig.color || "#ffffff",
      backgroundColor: textConfig.backgroundColor || "transparent",
      align: textConfig.align || "center",
      zIndex: textConfig.zIndex || 0,
      opacity: textConfig.opacity || 100,
      rotation: textConfig.rotation || 0,
      fadeInDuration: textConfig.fadeInDuration,
      fadeOutDuration: textConfig.fadeOutDuration,
      animation: textConfig.animation || "none",
    };

    onAddText(newTextElement);
    // Reset form
    setTextConfig({
      text: "Example",
      positionStart: lastEnd,
      positionEnd: lastEnd + 10,
      x: 500,
      y: 600,
      fontSize: 200,
      color: "#ff0000",
      backgroundColor: "transparent",
      align: "center",
      zIndex: 0,
      opacity: 100,
      rotation: 0,
      animation: "none",
    });
    toast.success("Text added successfully.");
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold">Add Text Element</h2>
      </div>

      <ScrollArea className="h-[450px] px-4">
        <div className="space-y-3">
          {/* Text Content Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-3 w-3 text-muted-foreground" />
              <Label htmlFor="text-content" className="text-xs font-medium">Content</Label>
            </div>
            <Textarea
              id="text-content"
              placeholder="Enter your text here..."
              value={textConfig.text}
              onChange={(e) =>
                setTextConfig({ ...textConfig, text: e.target.value })
              }
              className="min-h-[60px] resize-none"
            />
          </div>

          <Separator />

          {/* Timing Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <Label className="text-xs font-medium">Timing</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="start-time" className="text-xs text-muted-foreground">Start (s)</Label>
                <Input
                  id="start-time"
                  type="number"
                  min={0}
                  step={0.1}
                  value={textConfig.positionStart}
                  onChange={(e) =>
                    setTextConfig({
                      ...textConfig,
                      positionStart: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end-time" className="text-xs text-muted-foreground">End (s)</Label>
                <Input
                  id="end-time"
                  type="number"
                  min={0}
                  step={0.1}
                  value={textConfig.positionEnd}
                  onChange={(e) =>
                    setTextConfig({
                      ...textConfig,
                      positionEnd: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Position Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Move className="h-3 w-3 text-muted-foreground" />
              <Label className="text-xs font-medium">Position</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="x-position" className="text-xs text-muted-foreground">X (px)</Label>
                <Input
                  id="x-position"
                  type="number"
                  value={textConfig.x}
                  onChange={(e) =>
                    setTextConfig({
                      ...textConfig,
                      x: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="y-position" className="text-xs text-muted-foreground">Y (px)</Label>
                <Input
                  id="y-position"
                  type="number"
                  value={textConfig.y}
                  onChange={(e) =>
                    setTextConfig({
                      ...textConfig,
                      y: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Typography Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-3 w-3 text-muted-foreground" />
              <Label className="text-xs font-medium">Typography</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="font-family" className="text-xs text-muted-foreground">Font</Label>
                <Select
                  value={textConfig.font || "Arial"}
                  onValueChange={(value) =>
                    setTextConfig({ ...textConfig, font: value })
                  }
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
              <div className="space-y-1">
                <Label htmlFor="font-size" className="text-xs text-muted-foreground">Size (px)</Label>
                <Input
                  id="font-size"
                  type="number"
                  min={8}
                  max={500}
                  value={textConfig.fontSize}
                  onChange={(e) =>
                    setTextConfig({
                      ...textConfig,
                      fontSize: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Styling Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="h-3 w-3 text-muted-foreground" />
              <Label className="text-xs font-medium">Styling</Label>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="text-color" className="text-xs text-muted-foreground">Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="text-color"
                    type="color"
                    value={textConfig.color}
                    onChange={(e) =>
                      setTextConfig({ ...textConfig, color: e.target.value })
                    }
                    className="w-10 h-8 rounded border border-input cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={textConfig.color}
                    onChange={(e) =>
                      setTextConfig({ ...textConfig, color: e.target.value })
                    }
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="z-index" className="text-xs text-muted-foreground">Layer (Z-Index)</Label>
                <Input
                  id="z-index"
                  type="number"
                  min={0}
                  value={textConfig.zIndex}
                  onChange={(e) =>
                    setTextConfig({
                      ...textConfig,
                      zIndex: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Action Button */}
      <div className="pt-2 border-t">
        <Button
          onClick={handleAddText}
          className="w-full"
        >
          <Type className="w-4 h-4 mr-2" />
          Add Text Element
        </Button>
      </div>
    </div>
  );
}
