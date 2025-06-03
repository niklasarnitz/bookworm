import Image from "next/image";
import React from "react";

interface ImagePreviewProps {
  imageUrl: string;
  isProcessing?: boolean;
  isUploading?: boolean;
}

export function ImagePreview({
  imageUrl,
  isProcessing = false,
  isUploading = false,
}: Readonly<ImagePreviewProps>) {
  if (isProcessing || isUploading) {
    return (
      <div className="flex justify-center p-8 text-center">
        <div>
          <div
            className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
            aria-hidden="true"
          ></div>
          <p role="status">
            {isUploading ? "Uploading..." : "Processing image..."}
          </p>
        </div>
      </div>
    );
  }

  if (!imageUrl) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-40 w-32">
        <Image
          src={imageUrl}
          alt="Book cover preview"
          fill
          sizes="(max-width: 768px) 100px, 128px"
          style={{ objectFit: "contain" }}
          unoptimized={imageUrl.startsWith("blob:")} // Allow blob URLs during cropping
        />
      </div>
      <p className="text-sm text-gray-500">
        Click or drag to replace the image
      </p>
    </div>
  );
}
