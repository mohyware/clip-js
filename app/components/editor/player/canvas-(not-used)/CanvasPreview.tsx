







// TODO: use canva and get rid of the remotion player
// this is the old canvas preview but it is a good starting point







"use client";

import { useEffect, useRef, useState } from 'react';
import { VolumeX, Volume2, Play, Pause } from 'lucide-react';
import { MediaFile, TextElement } from '@/app/types';
import { useAppSelector, useAppDispatch, getProject, storeProject } from '@/app/store';
import { setCurrentTime, setIsPlaying, setIsMuted, rehydrate } from '@/app/store/slices/projectSlice';
import { formatTime } from '@/app/utils/utils';
import { updateProject } from '@/app/store/slices/projectsSlice';
import GlobalKeyHandlerProps from '@/app/components/editor/keys/GlobalKeyHandlerProps';
import { timeStamp } from 'console';


export default function CanvasPreview() {
    const dispatch = useAppDispatch();
    const projectState = useAppSelector((state) => state.projectState);
    const { currentTime, isPlaying, isMuted, duration, mediaFiles, textElements, resolution } = projectState;
    const { currentProjectId } = useAppSelector((state) => state.projects);
    const { width, height } = resolution;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const videoElementsRef = useRef<HTMLVideoElement[]>([]);
    const audioElementsRef = useRef<HTMLAudioElement[]>([]);
    const imageElementsRef = useRef<HTMLImageElement[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const timelineRef = useRef<HTMLDivElement>(null);
    const isFirstRun = useRef(true);

    const videoIndexMap = useRef<number[]>([]);
    const audioIndexMap = useRef<number[]>([]);
    const imageIndexMap = useRef<number[]>([]);

    // Initialize the canvas and setup the videos
    useEffect(() => {
        initCanvas();
        setupVideos();
        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(drawFrame);
        }
        else {
            console.log("not playing");           // Request a single frame
            animationFrameRef.current = requestAnimationFrame((timestamp) => {
                drawFrame(timestamp);
                // Cancel after drawing
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            });

            // // Cleanup
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            videoElementsRef.current.forEach(video => {
                video.pause();
                URL.revokeObjectURL(video.src);
            });
            audioElementsRef.current.forEach(audio => {
                audio.pause();
                URL.revokeObjectURL(audio.src);
            });
            imageElementsRef.current.forEach(image => {
                image.src = '';
            });
            dispatch(setIsPlaying(false));
        };
    }, [mediaFiles]);

    useEffect(() => {
        console.log("currentTime", currentTime);
    }, [currentTime]);

    useEffect(() => {
        if (!isPlaying) {
            // // Update all videos
            // videoIndexMap.current.forEach((fileIndex, elementIndex) => {
            //     const mediaFile = mediaFiles[fileIndex];
            //     const video = videoElementsRef.current[elementIndex];
            //     if (!video) return;

            //     if (currentTime >= mediaFile.positionStart && currentTime <= mediaFile.positionEnd) {
            //         const videoTime = mediaFile.startTime + (currentTime - mediaFile.positionStart);
            //         video.currentTime = videoTime;
            //     } else {
            //         video.pause();
            //         if (currentTime < mediaFile.positionStart) {
            //             video.currentTime = mediaFile.startTime;
            //         }
            //     }
            // })

            // startTimeRef.current = performance.now() - (currentTime * 1000);
            // dispatch(setCurrentTime(currentTime));
            // Request a single frame
            animationFrameRef.current = requestAnimationFrame((timestamp) => {
                console.log("currentTime", timestamp);
                drawFrame(timestamp);
                // Cancel after drawing
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            });

            // // Cleanup
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }
    }, [textElements, dispatch]);


    // set project state from with the current project id
    useEffect(() => {
        const loadProject = async () => {
            if (currentProjectId) {
                const project = await getProject(currentProjectId);
                if (project) {
                    dispatch(rehydrate(project));
                }
            }
        };
        loadProject();
    }, [dispatch, currentProjectId]);

    // Save the project state to the database
    // TODO: add a debounce to the saveProject function
    useEffect(() => {
        const saveProject = async () => {
            if (!projectState) return;
            await storeProject(projectState);
            dispatch(updateProject(projectState));
        };
        saveProject();
    }, [projectState, dispatch]);


    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Canvas context not supported');
            return;
        }

        ctxRef.current = ctx;
        canvas.width = width;
        canvas.height = height;
    };

    // Create new video and audio elements
    const setupVideos = () => {
        // Clear existing videos, audio and images
        videoElementsRef.current.forEach(video => {
            video.pause();
            video.src = '';
        });
        audioElementsRef.current.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        imageElementsRef.current.forEach(image => {
            image.src = '';
        });
        videoElementsRef.current = [];
        audioElementsRef.current = [];
        imageElementsRef.current = [];
        videoIndexMap.current = [];
        audioIndexMap.current = [];
        imageIndexMap.current = [];

        // mediaFiles.forEach((mediaFile, index) => {
        //     if (mediaFile.type === 'video') {
        //         const video = document.createElement('video');
        //         video.src = URL.createObjectURL(mediaFile.file);
        //         video.loop = true;
        //         video.muted = isMuted;
        //         video.playsInline = true;
        //         video.preload = 'auto';
        //         video.playbackRate = mediaFile.playbackSpeed || 1;
        //         video.volume = mediaFile.volume;
        //         videoElementsRef.current.push(video);
        //         videoIndexMap.current.push(index);

        //         video.addEventListener('loadedmetadata', () => {
        //             video.currentTime = mediaFile.startTime;
        //         });
        //     } else if (mediaFile.type === 'audio') {
        //         const audio = document.createElement('audio');
        //         audio.src = URL.createObjectURL(mediaFile.file);
        //         audio.loop = true;
        //         audio.muted = isMuted;
        //         audio.preload = 'auto';
        //         audio.volume = mediaFile.volume;
        //         audio.playbackRate = mediaFile.playbackSpeed || 1;
        //         audioElementsRef.current.push(audio);
        //         audioIndexMap.current.push(index);

        //         audio.addEventListener('loadedmetadata', () => {
        //             audio.currentTime = mediaFile.startTime;
        //         });
        //     } else if (mediaFile.type === 'image') {
        //         const image = document.createElement('img');
        //         image.src = URL.createObjectURL(mediaFile.file);
        //         imageElementsRef.current.push(image);
        //         imageIndexMap.current.push(index);
        //     }
        // });
    };

    // Draw frame
    const drawFrame = (timestamp: number) => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
        }
        const currentTimeSeconds = (timestamp - startTimeRef.current) / 1000;

        // Stop if we've reached the end
        if (currentTimeSeconds >= duration) {
            dispatch(setIsPlaying(false));
            dispatch(setCurrentTime(duration));
            videoElementsRef.current.forEach(video => {
                video.pause();
                if (isFinite(video.duration)) {
                    video.currentTime = video.duration;
                }
            });
            audioElementsRef.current.forEach(audio => {
                audio.pause();
                if (isFinite(audio.duration)) {
                    audio.currentTime = audio.duration;
                }
            });
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }

        if (isPlaying) {
            dispatch(setCurrentTime(currentTimeSeconds));
        }

        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        // Create an array of all active elements to be drawn
        const elementsToDraw: {
            type: 'video' | 'image' | 'text';
            element: HTMLVideoElement | HTMLImageElement | TextElement;
            mediaFile: MediaFile | TextElement;
            index: number;
        }[] = [];

        // Collect active video elements
        videoIndexMap.current.forEach((fileIndex, elementIndex) => {
            const mediaFile = mediaFiles[fileIndex];
            const video = videoElementsRef.current[elementIndex];
            if (!video) return;

            const isActive = currentTimeSeconds >= mediaFile.positionStart &&
                currentTimeSeconds <= mediaFile.positionEnd;

            if (isActive) {
                elementsToDraw.push({
                    type: 'video',
                    element: video,
                    mediaFile,
                    index: fileIndex
                });
            } else {
                video.pause();
                if (currentTimeSeconds < mediaFile.positionStart) {
                    video.currentTime = mediaFile.startTime;
                }
            }
        });

        // Collect active image elements
        imageIndexMap.current.forEach((fileIndex, elementIndex) => {
            const mediaFile = mediaFiles[fileIndex];
            const image = imageElementsRef.current[elementIndex];
            if (!image) return;

            const isActive = currentTimeSeconds >= mediaFile.positionStart &&
                currentTimeSeconds <= mediaFile.positionEnd;

            if (isActive) {
                elementsToDraw.push({
                    type: 'image',
                    element: image,
                    mediaFile,
                    index: fileIndex
                });
            }
        });

        // Collect active text elements
        textElements.forEach((textElement, index) => {
            const isActive = currentTimeSeconds >= textElement.positionStart &&
                currentTimeSeconds <= textElement.positionEnd;

            if (isActive) {
                elementsToDraw.push({
                    type: 'text',
                    element: textElement,
                    mediaFile: textElement,
                    index
                });
            }
        });

        // Sort elements by zIndex
        elementsToDraw.sort((a, b) => (a.mediaFile.zIndex || 0) - (b.mediaFile.zIndex || 0));

        // Draw all elements in order
        elementsToDraw.forEach(({ type, element, mediaFile }) => {
            if (type === 'video') {
                const video = element as HTMLVideoElement;
                const videoFile = mediaFile as MediaFile;
                if (video.paused) {
                    const videoTime = videoFile.startTime + (currentTimeSeconds - videoFile.positionStart);
                    video.currentTime = videoTime;
                    video.muted = isMuted;
                    video.play().catch(console.error);
                }

                // Calculate video position and size
                const videoAspect = video.videoWidth / video.videoHeight;
                const canvasAspect = width / height;

                let drawWidth = mediaFile.width || width;
                let drawHeight = mediaFile.height || height;
                let offsetX = mediaFile.x || 0;
                let offsetY = mediaFile.y || 0;

                if (videoAspect > canvasAspect) {
                    if (drawHeight === height && drawWidth === width)
                        drawHeight = width / videoAspect;
                    if (offsetY === 0 && offsetX === 0)
                        offsetY = (height - drawHeight) / 2;
                } else {
                    if (drawHeight === height && drawWidth === width)
                        drawWidth = height * videoAspect;
                    if (offsetY === 0 && offsetX === 0)
                        offsetX = (width - drawWidth) / 2;
                }

                ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

            } else if (type === 'image') {
                const image = element as HTMLImageElement;
                if (image.complete) {
                    // Calculate image position and size
                    const imageAspect = image.naturalWidth / image.naturalHeight;
                    const canvasAspect = width / height;

                    let drawWidth = width;
                    let drawHeight = height;
                    let offsetX = mediaFile.x || 0;
                    let offsetY = mediaFile.y || 0;

                    if (imageAspect > canvasAspect) {
                        drawHeight = width / imageAspect;
                        offsetY = (height - drawHeight) / 2;
                    } else {
                        drawWidth = height * imageAspect;
                        offsetX = (width - drawWidth) / 2;
                    }

                    // Apply image-specific properties
                    if (mediaFile.x !== undefined) offsetX = mediaFile.x;
                    if (mediaFile.y !== undefined) offsetY = mediaFile.y;
                    if (mediaFile.width !== undefined) drawWidth = mediaFile.width;
                    if (mediaFile.height !== undefined) drawHeight = mediaFile.height;
                    if (mediaFile.opacity !== undefined) ctx.globalAlpha = mediaFile.opacity;

                    // Apply rotation if specified
                    if (mediaFile.rotation !== undefined) {
                        ctx.save();
                        ctx.translate(offsetX + drawWidth / 2, offsetY + drawHeight / 2);
                        ctx.rotate(mediaFile.rotation * Math.PI / 180);
                        ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                        ctx.restore();
                    } else {
                        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
                    }

                    // Reset global alpha
                    if (mediaFile.opacity !== undefined) ctx.globalAlpha = 1;
                }
            } else if (type === 'text') {
                const textElement = element as TextElement;
                const timeInText = currentTimeSeconds - textElement.positionStart;
                const textDuration = textElement.positionEnd - textElement.positionStart;

                // Handle fade in/out
                let opacity = textElement.opacity || 1;
                if (textElement.fadeInDuration && timeInText < textElement.fadeInDuration) {
                    opacity = (timeInText / textElement.fadeInDuration) * (textElement.opacity || 1);
                }
                if (textElement.fadeOutDuration && timeInText > textDuration - textElement.fadeOutDuration) {
                    opacity = ((textDuration - timeInText) / textElement.fadeOutDuration) * (textElement.opacity || 1);
                }

                // Handle animations
                let x = textElement.x;
                let y = textElement.y;
                let scale = 1;

                if (textElement.animation === 'slide-in' && timeInText < 1) {
                    x = textElement.x - (width * (1 - timeInText));
                } else if (textElement.animation === 'zoom' && timeInText < 1) {
                    scale = 0.5 + (timeInText * 0.5);
                } else if (textElement.animation === 'bounce' && timeInText < 1) {
                    y = textElement.y - (50 * Math.sin(timeInText * Math.PI * 2));
                }

                ctx.save();
                ctx.globalAlpha = opacity;

                // Draw background if specified
                if (textElement.backgroundColor && textElement.backgroundColor !== 'transparent') {
                    ctx.fillStyle = textElement.backgroundColor;
                    const metrics = ctx.measureText(textElement.text);
                    const textWidth = metrics.width;
                    const textHeight = textElement.fontSize || 24;
                    ctx.fillRect(
                        x - 5,
                        y - textHeight + 5,
                        textWidth + 10,
                        textHeight + 10
                    );
                }

                // Set text properties
                ctx.font = `${textElement.fontSize || 24}px ${textElement.font || 'Arial'}`;
                ctx.fillStyle = textElement.color || '#ffffff';
                ctx.textAlign = textElement.align || 'center';

                // Apply transformations
                ctx.translate(x, y);
                ctx.scale(scale, scale);

                // Draw text
                ctx.fillText(textElement.text, 0, 0);
                ctx.restore();
            }
        });

        // Handle audio elements
        audioIndexMap.current.forEach((fileIndex, elementIndex) => {
            const mediaFile = mediaFiles[fileIndex];
            const audio = audioElementsRef.current[elementIndex];
            if (!audio) return;

            const isActive = currentTimeSeconds >= mediaFile.positionStart &&
                currentTimeSeconds <= mediaFile.positionEnd;

            if (isActive) {
                if (audio.readyState >= audio.HAVE_CURRENT_DATA) {
                    if (audio.paused) {
                        const audioTime = mediaFile.startTime + (currentTimeSeconds - mediaFile.positionStart);
                        audio.currentTime = audioTime;
                        audio.muted = isMuted;
                        audio.play().catch(console.error);
                    }
                }
            } else {
                audio.pause();
                if (currentTimeSeconds < mediaFile.positionStart) {
                    audio.currentTime = mediaFile.startTime;
                }
            }
        });
        // TODO: For Now Cause There is a bug here where the animation frame is being requested when the video is not playing
        if (!isPlaying && !isFirstRun.current) {
            animationFrameRef.current = requestAnimationFrame(drawFrame);
        }
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        const newTime = percentage * duration;

        // Update all videos
        videoIndexMap.current.forEach((fileIndex, elementIndex) => {
            const mediaFile = mediaFiles[fileIndex];
            const video = videoElementsRef.current[elementIndex];
            if (!video) return;

            if (newTime >= mediaFile.positionStart && newTime <= mediaFile.positionEnd) {
                const videoTime = mediaFile.startTime + (newTime - mediaFile.positionStart);
                video.currentTime = videoTime;
            } else {
                video.pause();
                if (newTime < mediaFile.positionStart) {
                    video.currentTime = mediaFile.startTime;
                }
            }
        })

        // Update all audios
        audioIndexMap.current.forEach((fileIndex, elementIndex) => {
            const mediaFile = mediaFiles[fileIndex];
            const audio = audioElementsRef.current[elementIndex];
            if (!audio) return;

            if (newTime >= mediaFile.positionStart && newTime <= mediaFile.positionEnd) {
                audio.currentTime = mediaFile.startTime + (newTime - mediaFile.positionStart);
            }
            else {
                audio.pause();
                if (newTime < mediaFile.positionStart) {
                    audio.currentTime = mediaFile.startTime;
                }
            }
        })
        startTimeRef.current = performance.now() - (newTime * 1000);
        dispatch(setCurrentTime(newTime));

        if (!isPlaying) {
            // Request a single frame
            animationFrameRef.current = requestAnimationFrame((timestamp) => {
                drawFrame(timestamp);
                // Cancel after drawing
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            });

            // // Cleanup
            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }
    }

    // Toggle Buttons
    const togglePlay = () => {
        isFirstRun.current = false;
        if (!isPlaying) {
            // If we're at the end, reset to start
            if (currentTime >= duration) {
                const newTime = 0;
                dispatch(setCurrentTime(newTime));
                startTimeRef.current = performance.now();
            } else {
                // Otherwise, continue from current position
                startTimeRef.current = performance.now() - (currentTime * 1000);
            }
            // Start the animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(drawFrame);
        } else {
            // Pause all media and stop animation
            if (animationFrameRef.current) {
                videoElementsRef.current.forEach(video => video.pause());
                audioElementsRef.current.forEach(audio => audio.pause());
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
        dispatch(setIsPlaying(!isPlaying));
    };
    const toggleMute = () => {
        dispatch(setIsMuted(!isMuted));
        videoElementsRef.current.forEach(video => {
            video.muted = !isMuted;
        });
        audioElementsRef.current.forEach(audio => {
            audio.muted = !isMuted;
        });
    };


    return (
        <div className="relative">
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: '100%', height: 'auto' }}
                className="border border-gray-300 rounded"
            />
            {/* Video controls */}
            <div className="absolute bottom-16 right-2 flex space-x-2">
                <button
                    onClick={toggleMute}
                    className="bg-white hover:bg-gray-200 text-black py-1 px-3 rounded"
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                {/* <GlobalKeyHandlerProps onSpace={togglePlay} onMute={toggleMute} /> */}
                <button
                    onClick={togglePlay}
                    className="bg-white hover:bg-gray-200 text-black py-1 px-3 rounded"
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
            </div>

            {/* Timeline */}
            <div className="mt-2">
                <div
                    ref={timelineRef}
                    className="relative h-3 bg-gray-300 rounded-full cursor-pointer"
                    onClick={handleTimelineClick}
                >
                    <div
                        className="absolute h-full inset-y-0 left-[-2px] bg-black rounded-full"
                        style={{ width: `${(currentTime / duration) * 100 + 1}%` }}
                    />
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
} 