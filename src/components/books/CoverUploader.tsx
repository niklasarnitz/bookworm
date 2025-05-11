import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Image from "next/image";
import { z } from "zod";

const uploadResponseSchema = z.object({
  success: z.boolean(),
  url: z.string().url(),
  objectName: z.string(),
  etag: z.string(),
});

type CropData = {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: string;
};

interface CoverUploaderProps {
  onImageUpload: (url: string) => void;
  defaultImageUrl?: string;
  isbn?: string | null;
  onFetchFromAmazon?: () => void;
  onRemoveCover?: () => void;
}

export function CoverUploader({
  onImageUpload,
  defaultImageUrl,
  isbn,
  onFetchFromAmazon,
  onRemoveCover,
}: Readonly<CoverUploaderProps>) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    defaultImageUrl ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<CropData | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Clean up any existing blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  // Function to initialize cropping without aspect ratio constraints
  const initializeCrop = useCallback(
    (mediaWidth: number, mediaHeight: number) => {
      return centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 100,
          },
          mediaWidth / mediaHeight, // Use the image's natural aspect ratio
          mediaWidth,
          mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
      );
    },
    [],
  );

  // Effect to handle when defaultImageUrl is updated externally (e.g., from Amazon search)
  useEffect(() => {
    // Only process if defaultImageUrl changes and it's different from the current imageUrl
    if (
      defaultImageUrl &&
      defaultImageUrl !== imageUrl &&
      !defaultImageUrl.startsWith("blob:")
    ) {
      setImageUrl(defaultImageUrl);

      // Skip processing for our own uploaded images that come back from the server
      if (!defaultImageUrl.includes("/api/") && !isProcessing) {
        void handleExternalImageUrl(defaultImageUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultImageUrl]);

  // Handle external image URL (e.g., from Amazon)
  const handleExternalImageUrl = async (url: string) => {
    // Prevent reprocessing the same URL
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Clean up any existing blob URL first
      if (blobUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      // Fetch the image as a blob
      console.log(`Fetching external image: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();

      // Create a File object from the blob
      const fileName = url.split("/").pop() ?? "cover.jpg";
      const fileFromBlob = new File([blob], fileName, { type: blob.type });

      // Set the file and prepare for cropping
      setFile(fileFromBlob);
      const objectUrl = URL.createObjectURL(fileFromBlob);
      blobUrlRef.current = objectUrl;

      // Wait for the image to load before showing the cropper
      await new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.src = objectUrl;
      });

      setImageUrl(objectUrl);
      setShowCropper(true);
    } catch (err) {
      console.error("Error processing external image:", err);
      setError("Failed to load the external image");
      setImageUrl(defaultImageUrl ?? null); // Revert to default if available
    } finally {
      setIsProcessing(false);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Initialize with the image's natural aspect ratio
    setCrop(initializeCrop(width, height));
  };

  const uploadImage = async () => {
    if (!file || !imgRef.current || !completedCrop) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Get the natural dimensions of the image and the displayed dimensions
      const { naturalWidth, naturalHeight, width, height } = imgRef.current;
      console.log("Original image dimensions:", {
        naturalWidth,
        naturalHeight,
      });
      console.log("Displayed image dimensions:", { width, height });

      // Calculate scaling factors between the displayed image and the natural image
      const scaleX = naturalWidth / width;
      const scaleY = naturalHeight / height;

      console.log("Completed crop data:", completedCrop);

      // Scale up the crop data from display size to original image size
      const scaledCrop = {
        x: Math.round(completedCrop.x * scaleX),
        y: Math.round(completedCrop.y * scaleY),
        width: Math.round(completedCrop.width * scaleX),
        height: Math.round(completedCrop.height * scaleY),
        unit: "px",
      };

      // Ensure crop region doesn't extend beyond image bounds
      const boundedCrop = {
        x: Math.max(0, scaledCrop.x),
        y: Math.max(0, scaledCrop.y),
        width: Math.min(scaledCrop.width, naturalWidth - scaledCrop.x),
        height: Math.min(scaledCrop.height, naturalHeight - scaledCrop.y),
        unit: "px",
      };

      console.log("Scaled and bounded crop data being sent:", boundedCrop);
      formData.append("cropData", JSON.stringify(boundedCrop));

      const response = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
      });

      // Check if response is OK before attempting to parse JSON
      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`,
        );
      }

      // Use response.json() directly instead of response.text()
      const rawData = (await response.json()) as unknown;

      // Validate the response using Zod
      const result = uploadResponseSchema.safeParse(rawData);

      if (result.success) {
        const data = result.data;

        // Clean up the blob URL before setting the new server URL
        if (blobUrlRef.current?.startsWith("blob:")) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }

        setImageUrl(data.url);
        onImageUpload(data.url);
        setShowCropper(false);
      } else {
        console.error("Invalid response format:", rawData);
        setError("Upload failed: Invalid server response");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    console.log("Files dropped:", acceptedFiles);

    if (acceptedFiles.length === 0) {
      setError("Please select a valid image file");
      return;
    }

    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      console.log("Processing file:", selectedFile.name);
      setFile(selectedFile);

      // Clean up any existing blob URL first
      if (blobUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      // Create new blob URL
      const objectUrl = URL.createObjectURL(selectedFile);
      blobUrlRef.current = objectUrl;
      setImageUrl(objectUrl);
      setShowCropper(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 1,
  });

  const cancelCrop = () => {
    setShowCropper(false);

    // If we were using a blob URL, clean it up and revert to default
    if (
      imageUrl?.startsWith("blob:") &&
      defaultImageUrl &&
      !defaultImageUrl.startsWith("blob:")
    ) {
      // Clean up blob URL
      URL.revokeObjectURL(imageUrl);
      blobUrlRef.current = null;

      // Revert to server URL
      setImageUrl(defaultImageUrl);
      setFile(null);
    }
  };

  const handleCropComplete = (crop: Crop) => {
    // Convert to strongly typed CropData
    const typedCrop: CropData = {
      x: crop.x || 0,
      y: crop.y || 0,
      width: crop.width || 0,
      height: crop.height || 0,
      unit: crop.unit,
    };

    setCompletedCrop(typedCrop);
  };

  const handleRemoveCover = () => {
    // Clean up any blob URLs
    if (imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
      blobUrlRef.current = null;
    }

    setImageUrl(null);
    setFile(null);

    // Make sure we call the parent's onRemoveCover function
    if (onRemoveCover) {
      onRemoveCover();
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div
          className="rounded border border-red-400 bg-red-100 p-3 text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {!showCropper && !isProcessing && (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors ${isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50 border-gray-300"}`}
          role="button"
          tabIndex={0}
          aria-label="Upload cover image"
        >
          <input {...getInputProps()} />

          {imageUrl ? (
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
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <p>Drag & drop a cover image here, or click to select one</p>
              <p className="text-sm text-gray-500">
                Recommended: JPG or PNG, 3:4 aspect ratio
              </p>
            </div>
          )}
        </div>
      )}

      {(isProcessing || isUploading) && (
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
      )}

      {showCropper && imageUrl && (
        <Card className="space-y-4 p-4">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={handleCropComplete}
              className="max-h-80"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-80 max-w-full"
              />
            </ReactCrop>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelCrop}>
              Cancel
            </Button>
            <Button onClick={uploadImage} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Save Crop"}
            </Button>
          </div>
        </Card>
      )}

      {/* Action buttons */}
      {!showCropper && !isProcessing && !isUploading && (
        <div className="flex flex-wrap gap-2">
          {onFetchFromAmazon && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onFetchFromAmazon}
              disabled={!isbn}
              className="text-xs"
              aria-label={
                isbn
                  ? "Get cover image from Amazon"
                  : "ISBN required to fetch cover from Amazon"
              }
            >
              Get Cover from Amazon
            </Button>
          )}

          {imageUrl && onRemoveCover && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveCover}
              className="border-red-200 text-xs text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove cover image"
            >
              Remove Cover
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
