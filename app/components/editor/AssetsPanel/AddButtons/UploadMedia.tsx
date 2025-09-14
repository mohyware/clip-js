"use client";

import { listFiles, useAppDispatch, useAppSelector } from "../../../../store";
import { setMediaFiles, setFilesID } from "../../../../store/slices/projectSlice";
import { storeFile } from "../../../../store";
import { categorizeFile } from "../../../../utils/utils";
import Image from 'next/image';
import { Upload } from 'lucide-react';

export default function AddMedia() {
    const { mediaFiles, filesID } = useAppSelector((state) => state.projectState);
    const dispatch = useAppDispatch();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        const updatedFiles = [...filesID || []];
        for (const file of newFiles) {
            const fileId = crypto.randomUUID();
            await storeFile(file, fileId);
            updatedFiles.push(fileId)
        }
        dispatch(setFilesID(updatedFiles));
        e.target.value = "";
    };

    return (
        <div
        >
            <label
                htmlFor="file-upload"
                className="cursor-pointer rounded-full bg-white border border-solid border-transparent transition-colors flex flex-row gap-2 items-center justify-center text-gray-800 hover:bg-[#ccc] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-auto py-2 px-2 sm:px-5 sm:w-auto"
            >
                <Upload className="text-black" size={12} />
                <span className="text-xs">Add Media</span>
            </label>
            <input
                type="file"
                accept="video/*,audio/*,image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
            />
        </div>
    );
}
