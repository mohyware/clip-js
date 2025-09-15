'use client'

import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import FfmpegRender from "./FfmpegRender";
import RenderOptions from "./RenderOptions";
export default function Ffmpeg() {
    const [loadFfmpeg, setLoadedFfmpeg] = useState(false);
    const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
    const [logMessages, setLogMessages] = useState<string>("");

    const loadFFmpegFunction = async () => {
        setLoadedFfmpeg(false);
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on("log", ({ message }) => {
            setLogMessages(message);
        });

        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            // TODO: For Multi Threading as mentioned in the ffmpeg docs but it is not fetched for some reason
            // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        });

        setLoadedFfmpeg(true);
    };

    useEffect(() => {
        loadFFmpegFunction();
    }, []);

    return (
        <div className="space-y-6">
            <FfmpegRender loadFunction={loadFFmpegFunction} loadFfmpeg={loadFfmpeg} logMessages={logMessages} ffmpeg={ffmpegRef.current} />
        </div>
    );
}
