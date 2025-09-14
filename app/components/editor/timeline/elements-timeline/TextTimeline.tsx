import React, { useRef, useCallback, useMemo } from "react";
import Moveable, { OnScale, OnDrag, OnResize, OnRotate } from "react-moveable";
import { useAppSelector } from "@/app/store";
import { setActiveElement, setActiveElementIndex, setTextElements } from "@/app/store/slices/projectSlice";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { Type } from "lucide-react";
import Header from "../Header";
import { MediaFile, TextElement } from "@/app/types";
import { debounce, throttle } from "lodash";

export default function TextTimeline() {
    const targetRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const { textElements, activeElement, activeElementIndex, timelineZoom } = useAppSelector((state) => state.projectState);
    const dispatch = useDispatch();
    const moveableRef = useRef<Record<string, Moveable | null>>({});


    // this affect the performance cause of too much re-renders

    // const onUpdateMedia = (id: string, updates: Partial<MediaFile>) => {
    //     dispatch(setMediaFiles(mediaFiles.map(media =>
    //         media.id === id ? { ...media, ...updates } : media
    //     )));
    // };

    // TODO: this is a hack to prevent the mediaFiles from being updated too often while dragging or resizing
    const textElementsRef = useRef(textElements);
    useEffect(() => {
        textElementsRef.current = textElements;
    }, [textElements]);

    const onUpdateText = useMemo(() =>
        throttle((id: string, updates: Partial<TextElement>) => {
            const currentFiles = textElementsRef.current;
            const updated = currentFiles.map(text =>
                text.id === id ? { ...text, ...updates } : text
            );
            dispatch(setTextElements(updated));
        }, 100), [dispatch]
    );

    const handleClick = (element: string, index: number | string) => {
        if (element === 'text') {
            dispatch(setActiveElement('text') as any);
            // TODO: find better way to do this
            const actualIndex = textElements.findIndex(clip => clip.id === index as unknown as string);
            dispatch(setActiveElementIndex(actualIndex));
        }
    };

    const handleDrag = (clip: TextElement, target: HTMLElement, left: number) => {
        // no negative left
        const constrainedLeft = Math.max(left, 0);
        const newPositionStart = constrainedLeft / timelineZoom;
        onUpdateText(clip.id, {
            positionStart: newPositionStart,
            positionEnd: (newPositionStart - clip.positionStart) + clip.positionEnd,
        })

        target.style.left = `${constrainedLeft}px`;
    };

    const handleResize = (clip: TextElement, target: HTMLElement, width: number) => {
        const newPositionEnd = width / timelineZoom;

        onUpdateText(clip.id, {
            positionEnd: clip.positionStart + newPositionEnd,
        })
    };
    const handleLeftResize = (clip: TextElement, target: HTMLElement, width: number) => {
        const newPositionEnd = width / timelineZoom;
        // Ensure we do not resize beyond the right edge of the clip
        const constrainedLeft = Math.max(clip.positionStart + ((clip.positionEnd - clip.positionStart) - newPositionEnd), 0);

        onUpdateText(clip.id, {
            positionStart: constrainedLeft,
            // startTime: constrainedLeft,
        })
    };

    useEffect(() => {
        for (const clip of textElements) {
            moveableRef.current[clip.id]?.updateRect();
        }
    }, [timelineZoom]);

    return (
        <div >
            {textElements.map((clip, index) => (
                <div key={clip.id} className="bg-chart-1">
                    <div
                        key={clip.id}
                        ref={(el: HTMLDivElement | null) => {
                            if (el) {
                                targetRefs.current[clip.id] = el;
                            }
                        }}
                        onClick={() => handleClick('text', clip.id)}
                        className={`absolute border border-border rounded-md top-2 h-12 bg-secondary text-secondary-foreground text-sm flex items-center justify-center cursor-pointer ${activeElement === 'text' && textElements[activeElementIndex].id === clip.id ? 'bg-accent border-primary' : ''}`}
                        style={{
                            left: `${clip.positionStart * timelineZoom}px`,
                            width: `${(clip.positionEnd - clip.positionStart) * timelineZoom}px`,
                            zIndex: clip.zIndex,
                        }}
                    >
                        {/* <MoveableTimeline /> */}
                        <Type className="h-7 w-7 min-w-6 mr-2 flex-shrink-0" />
                        <span className="truncate text-x">{clip.text}</span>

                    </div>

                    <Moveable
                        ref={(el: Moveable | null) => {
                            if (el) {
                                moveableRef.current[clip.id] = el;
                            }
                        }}
                        target={targetRefs.current[clip.id] || null}
                        container={null}
                        renderDirections={activeElement === 'text' && textElements[activeElementIndex] && textElements[activeElementIndex].id === clip.id ? ['w', 'e'] : []}
                        draggable={true}
                        throttleDrag={0}
                        rotatable={false}
                        onDragStart={({ target, clientX, clientY }) => {
                        }}
                        onDrag={({
                            target,
                            beforeDelta, beforeDist,
                            left,
                            right,
                            delta, dist,
                            transform,
                        }: OnDrag) => {
                            handleClick('text', clip.id)
                            handleDrag(clip, target as HTMLElement, left);
                        }}
                        onDragEnd={({ target, isDrag, clientX, clientY }) => {
                        }}

                        /* resizable*/
                        resizable={true}
                        throttleResize={0}
                        onResizeStart={({ target, clientX, clientY }) => {
                        }}
                        onResize={({
                            target, width,
                            delta, direction,
                        }: OnResize) => {
                            if (direction[0] === 1) {
                                handleClick('text', clip.id)
                                delta[0] && (target!.style.width = `${width}px`);
                                handleResize(clip, target as HTMLElement, width);

                            }
                            else if (direction[0] === -1) {
                                // TODO: handle left resize
                                // handleClick('text', clip.id)
                                // delta[0] && (target!.style.width = `${width}px`);
                                // handleLeftResize(clip, target as HTMLElement, width);
                            }
                        }}
                        onResizeEnd={({ target, isDrag, clientX, clientY }) => {
                        }}

                    />
                </div>

            ))}
        </div>
    );
}
