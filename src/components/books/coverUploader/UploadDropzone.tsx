import React from "react";
import { useDropzone } from "react-dropzone";
import { ImagePreview } from "./ImagePreview";

interface UploadDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  imageUrl: string | null;
}

export function UploadDropzone({
  onDrop,
  imageUrl,
}: Readonly<UploadDropzoneProps>) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors ${isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50 border-gray-300"}`}
      role="button"
      tabIndex={0}
      aria-label="Upload cover image"
    >
      <input {...getInputProps()} />

      {imageUrl ? (
        <ImagePreview imageUrl={imageUrl} />
      ) : (
        <div className="flex flex-col items-center gap-2 py-4">
          <p>Drag & drop a cover image here, or click to select one</p>
          <p className="text-sm text-gray-500">
            Recommended: JPG or PNG, 3:4 aspect ratio
          </p>
        </div>
      )}
    </div>
  );
}
