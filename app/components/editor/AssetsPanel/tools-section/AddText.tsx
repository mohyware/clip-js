"use client";

import { useState } from 'react';
import { TextElement } from '../../../../types';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { setResolution, setTextElements } from '../../../../store/slices/projectSlice';
import toast from 'react-hot-toast';

export default function AddTextButton() {
    const [textConfig, setTextConfig] = useState<Partial<TextElement>>({
        text: 'Example',
        positionStart: 0,
        positionEnd: 10,
        x: 600,
        y: 500,
        fontSize: 200,
        color: '#ff0000',
        backgroundColor: 'transparent',
        align: 'center',
        zIndex: 0,
        opacity: 100,
        rotation: 0,
        animation: 'none'
    });
    const { textElements } = useAppSelector((state) => state.projectState);
    const dispatch = useAppDispatch();

    const onAddText = (textElement: TextElement) => {
        dispatch(setTextElements([...textElements, textElement]));
    };

    const handleAddText = () => {
        const lastEnd = textElements.length > 0 ? Math.max(...textElements.map(f => f.positionEnd)) : 0;

        const newTextElement: TextElement = {
            id: crypto.randomUUID(),
            text: textConfig.text || '',
            positionStart: lastEnd || 0,
            positionEnd: lastEnd + 10 || 10,
            x: textConfig.x || 0,
            y: textConfig.y || 0,
            width: textConfig.width,
            height: textConfig.height,
            font: textConfig.font || 'Arial',
            fontSize: textConfig.fontSize || 24,
            color: textConfig.color || '#ffffff',
            backgroundColor: textConfig.backgroundColor || 'transparent',
            align: textConfig.align || 'center',
            zIndex: textConfig.zIndex || 0,
            opacity: textConfig.opacity || 100,
            rotation: textConfig.rotation || 0,
            fadeInDuration: textConfig.fadeInDuration,
            fadeOutDuration: textConfig.fadeOutDuration,
            animation: textConfig.animation || 'none'
        };

        onAddText(newTextElement);
        // Reset form
        setTextConfig({
            text: 'Example',
            positionStart: lastEnd,
            positionEnd: lastEnd + 10,
            x: 500,
            y: 600,
            fontSize: 200,
            color: '#ff0000',
            backgroundColor: 'transparent',
            align: 'center',
            zIndex: 0,
            opacity: 100,
            rotation: 0,
            animation: 'none'
        });
        toast.success('Text added successfully.');
    };

    return (
        <div className="relative">
            {(
                <div className="flex items-center justify-center z-50">
                    <div className="p-6 rounded-lg w-96">
                        <div className="space-y-8">
                            {/* Text Content */}
                            <div>
                                <label className="text-xl font-bold mb-2 text-white">Text Content</label>
                                <textarea
                                    value={textConfig.text}
                                    onChange={(e) => setTextConfig({ ...textConfig, text: e.target.value })}
                                    className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                />
                            </div>

                            {/* Start and End Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white">Start Time (s)</label>
                                    <input
                                        type="number"
                                        value={textConfig.positionStart}
                                        onChange={(e) => setTextConfig({ ...textConfig, positionStart: Number(e.target.value) })}
                                        className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white">End Time (s)</label>
                                    <input
                                        type="number"
                                        value={textConfig.positionEnd}
                                        onChange={(e) => setTextConfig({ ...textConfig, positionEnd: Number(e.target.value) })}
                                        className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                        min={0}
                                    />
                                </div>
                            </div>

                            {/* Position */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white">X Position</label>
                                    <input
                                        type="number"
                                        value={textConfig.x}
                                        onChange={(e) => setTextConfig({ ...textConfig, x: Number(e.target.value) })}
                                        className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white">Y Position</label>
                                    <input
                                        type="number"
                                        value={textConfig.y}
                                        onChange={(e) => setTextConfig({ ...textConfig, y: Number(e.target.value) })}
                                        className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                    />
                                </div>
                            </div>

                            {/* Font Size and Z-Index */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white">Font Size</label>
                                    <input
                                        type="number"
                                        value={textConfig.fontSize}
                                        onChange={(e) => setTextConfig({ ...textConfig, fontSize: Number(e.target.value) })}
                                        className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                        min={0}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white">Z-Index</label>
                                    <input
                                        type="number"
                                        value={textConfig.zIndex}
                                        onChange={(e) => setTextConfig({ ...textConfig, zIndex: Number(e.target.value) })}
                                        className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                        min={0}
                                    />
                                </div>
                            </div>

                            {/* Font Type */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white">Font Type</label>
                                    <select
                                        value={textConfig.font}
                                        onChange={(e) => setTextConfig({ ...textConfig, font: e.target.value })}
                                        className="w-full p-2 bg-darkSurfacePrimary border border-white border-opacity-10 shadow-md text-white rounded focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-white-500"
                                    >
                                        <option value="Arial">Arial</option>
                                        <option value="Inter">Inter</option>
                                        <option value="Lato">Lato</option>
                                    </select>
                                </div>
                            </div>

                            {/* Text Color and Add Text Button */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white">Text Color</label>
                                    <input
                                        type="color"
                                        value={textConfig.color}
                                        onChange={(e) => setTextConfig({ ...textConfig, color: e.target.value })}
                                        className="mt-1 block w-full bg-darkSurfacePrimary rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mt-2 flex justify-end space-x-3">
                                    <button
                                        onClick={handleAddText}
                                        className="px-4 py-2 bg-white text-black hover:bg-[#ccc] rounded"
                                    >
                                        Add Text
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
} 