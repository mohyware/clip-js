import { Skeleton } from "@/components/ui/skeleton";
import { Play, Video } from "lucide-react";
import React from "react";

type Props = {};

export default function LoadingSkeleton(props: Props) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Skeleton for Main Resizable Layout */}
      <div className="h-full flex flex-col">
        {/* Main Editor Area Skeleton */}
        <div className="flex-[75] flex">
          {/* Left Panel Skeleton */}
          <div className="w-[22%] min-w-[15%] max-w-[35%] border-r border-border flex flex-col">
            {/* Tabs Header Skeleton */}
            <div className="border-b border-border bg-background p-6">
              <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
                <Skeleton className="h-8 rounded-md" />
                <Skeleton className="h-8 rounded-md" />
                <Skeleton className="h-8 rounded-md" />
              </div>
            </div>

            {/* Content Area Skeleton */}
            <div className="flex-1 p-6 space-y-4">
              {/* Upload Button Skeleton */}
              <Skeleton className="h-10 w-full rounded-lg" />

              {/* Media Items Skeleton */}
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Video Preview Skeleton */}
          <div className="flex-[56] min-w-[30%] flex flex-col bg-muted/30">
            {/* Top Controls Skeleton */}
            <div className="h-12 border-b border-border bg-muted/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            {/* Video Container Skeleton */}
            <div className="flex-1 flex flex-col bg-background">
              <div className="flex-1 flex items-center justify-center p-8">
                {/* Video Player Skeleton */}
                <div className="relative w-full max-w-4xl aspect-video">
                  <Skeleton className="w-full h-full rounded-lg" />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary/50 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Controls Skeleton */}
              <div className="h-14 flex items-center justify-center gap-4 px-4 border-t border-border bg-background">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="w-[22%] min-w-[15%] max-w-[35%] border-l border-border p-4">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section Skeleton */}
        <div className="flex-[25] min-h-[15%] max-h-[50%] border-t border-border p-4">
          <div className="space-y-3">
            {/* Timeline Header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            {/* Timeline Tracks */}
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-16" />
                  <div className="flex-1 flex gap-1">
                    {[...Array(8)].map((_, j) => (
                      <Skeleton
                        key={j}
                        className="h-8 flex-1 rounded-sm"
                        style={{
                          animationDelay: `${(i * 8 + j) * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
