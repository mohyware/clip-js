"use client";

import { listFiles, useAppDispatch, useAppSelector } from "../../../../store";
import { setMediaFiles, setFilesID } from "../../../../store/slices/projectSlice";
import { storeFile } from "../../../../store";
import { categorizeFile } from "../../../../utils/utils";
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div>
            <Button
                variant="secondary"
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-accent h-auto py-2 px-2 sm:px-5"
                asChild
            >
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-row gap-2 items-center justify-center"
                >
                    <Upload className="text-black" size={12} />
                    <span className="text-xs">Add Media</span>
                </label>
            </Button>
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
