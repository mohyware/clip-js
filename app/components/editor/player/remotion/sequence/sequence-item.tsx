import { AbsoluteFill, OffthreadVideo, Audio, Img, Sequence } from "remotion";
import { MediaFile, TextElement } from "@/app/types";

const REMOTION_SAFE_FRAME = 0;

interface SequenceItemOptions {
    handleTextChange?: (id: string, text: string) => void;
    fps: number;
    editableTextId?: string | null;
    currentTime?: number;
}

const calculateFrames = (
    display: { from: number; to: number },
    fps: number
) => {
    const from = display.from * fps;
    const to = display.to * fps;
    const durationInFrames = Math.max(1, to - from);
    return { from, durationInFrames };
};

export const SequenceItem: Record<
    string,
    (item: any, options: SequenceItemOptions) => JSX.Element> = {
    video: (item: MediaFile, options: SequenceItemOptions) => {
        const { fps } = options;

        const playbackRate = item.playbackSpeed || 1;
        const { from, durationInFrames } = calculateFrames(
            {
                from: item.positionStart,
                to: item.positionEnd
            },
            fps
        );

        // TODO: Add crop
        // const crop = item.crop || {
        //     x: 0,
        //     y: 0,
        //     width: item.width,
        //     height: item.height
        // };

        const trim = {
            from: (item.startTime) / playbackRate,
            to: (item.endTime) / playbackRate
        };

        return (
            <Sequence
                key={item.id}
                from={from}
                durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
                style={{ pointerEvents: "none" }}
            >
                <AbsoluteFill
                    data-track-item="transition-element"
                    className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
                    style={{
                        pointerEvents: "auto",
                        top: item.y,
                        left: item.x,
                        width: item.width || "100%",
                        height: item.height || "auto",
                        transform: "none",
                        zIndex: item.zIndex,
                        opacity:
                            item?.opacity !== undefined
                                ? item.opacity / 100
                                : 1,
                        borderRadius: `10px`, // Default border radius
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: item.width || "100%",
                            height: item.height || "auto",
                            position: "relative",
                            overflow: "hidden",
                            pointerEvents: "none",
                        }}
                    >
                        <OffthreadVideo
                            startFrom={(trim.from) * fps}
                            endAt={(trim.to) * fps + REMOTION_SAFE_FRAME}
                            playbackRate={playbackRate}
                            src={item.src || ""}
                            volume={item.volume / 100 || 100}
                            style={{
                                pointerEvents: "none",
                                top: 0,
                                left: 0,
                                width: item.width || "100%", // Default width
                                height: item.height || "auto", // Default height
                                position: "absolute"
                            }}
                        />
                    </div>
                </AbsoluteFill>
            </Sequence>
        );
    },
    text: (item: TextElement, options: SequenceItemOptions) => {
        const { handleTextChange, fps, editableTextId } = options;


        const { from, durationInFrames } = calculateFrames(
            {
                from: item.positionStart,
                to: item.positionEnd
            },
            fps
        );

        // TODO: add more options for text
        return (
            <Sequence
                className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-text pointer-events-none`}
                key={item.id}
                from={from}
                durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
                data-track-item="transition-element"
                style={{
                    position: "absolute",
                    width: item.width || 3000,
                    height: item.height || 400,
                    fontSize: item.fontSize || "16px",
                    top: item.y,
                    left: item.x,
                    color: item.color || "#000000",
                    // backgroundColor: item.backgroundColor || "transparent",
                    opacity: item.opacity! / 100,
                    fontFamily: item.font || "Arial",
                }}
            >
                <div
                    data-text-id={item.id}
                    style={{
                        height: "100%",
                        boxShadow: "none",
                        outline: "none",
                        whiteSpace: "normal",
                        backgroundColor: item.backgroundColor || "transparent",
                        zIndex: item.zIndex || 0,
                        position: "relative",
                        width: "100%",
                    }}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                    className="designcombo_textLayer"
                />
            </Sequence>
        );
    },
    image: (item: MediaFile, options: SequenceItemOptions) => {
        const { fps } = options;

        const { from, durationInFrames } = calculateFrames(
            {
                from: item.positionStart,
                to: item.positionEnd
            },
            fps
        );

        const crop = item.crop || {
            x: 0,
            y: 0,
            width: item.width,
            height: item.height
        };

        return (
            <Sequence
                key={item.id}
                from={from}
                durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
                style={{ pointerEvents: "none" }}
            >
                <AbsoluteFill
                    data-track-item="transition-element"
                    className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
                    style={{
                        pointerEvents: "auto",
                        top: item.y,
                        left: item.x,
                        width: crop.width || "100%",
                        height: crop.height || "auto",
                        // transform: item?.transform || "none",
                        opacity:
                            item?.opacity !== undefined
                                ? item.opacity / 100
                                : 1,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: item.width || "100%",
                            height: item.height || "auto",
                            position: "relative",
                            overflow: "hidden",
                            pointerEvents: "none",
                        }}
                    >
                        <Img
                            style={{
                                pointerEvents: "none",
                                top: -crop.y || 0,
                                left: -crop.x || 0,
                                width: item.width || "100%",
                                height: item.height || "auto",
                                position: "absolute",
                                zIndex: item.zIndex || 0,
                            }}
                            data-id={item.id}
                            src={item.src || ""}
                        />
                    </div>
                </AbsoluteFill>
            </Sequence>
        );
    },
    audio: (item: MediaFile, options: SequenceItemOptions) => {
        const { fps } = options;
        const playbackRate = item.playbackSpeed || 1;
        const { from, durationInFrames } = calculateFrames(
            {
                from: item.positionStart / playbackRate,
                to: item.positionEnd / playbackRate
            },
            fps
        );

        const trim = {
            from: (item.startTime) / playbackRate,
            to: (item.endTime) / playbackRate
        };
        return (
            <Sequence
                key={item.id}
                from={from}
                durationInFrames={durationInFrames + REMOTION_SAFE_FRAME}
                style={{
                    userSelect: "none",
                    pointerEvents: "none"
                }}
            >
                <AbsoluteFill>
                    <Audio
                        startFrom={(trim.from) * fps}
                        endAt={(trim.to) * fps + REMOTION_SAFE_FRAME}
                        playbackRate={playbackRate}
                        src={item.src || ""}
                        volume={item.volume / 100 || 100}
                    />
                </AbsoluteFill>
            </Sequence>
        );
    }
};
