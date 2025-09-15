"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { storeFile, useAppDispatch, useAppSelector } from "../../../../store";
import { setFilesID } from "../../../../store/slices/projectSlice";

export default function AddMedia() {
  const { mediaFiles, filesID } = useAppSelector((state) => state.projectState);
  const dispatch = useAppDispatch();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter((file) => {
      const isValid =
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/") ||
        file.type.startsWith("image/");
      if (!isValid) {
        toast.error(`${file.name} is not a supported file type`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      const updatedFiles = [...(filesID || [])];
      for (const file of validFiles) {
        const fileId = crypto.randomUUID();
        await storeFile(file, fileId);
        updatedFiles.push(fileId);
      }
      dispatch(setFilesID(updatedFiles));
      toast.success(
        `${validFiles.length} file${
          validFiles.length > 1 ? "s" : ""
        } uploaded successfully`
      );
    } catch (error) {
      toast.error("Error uploading files");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files) {
      await handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Media Library</h2>

            <Button variant="default" size="sm" disabled={isUploading} asChild>
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add Media</span>
                  </>
                )}
              </label>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload and manage your video, audio, and image files
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <input
          type="file"
          accept="video/*,audio/*,image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
      </div>
    </>
  );
}
