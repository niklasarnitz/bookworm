import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { z } from "zod";

const uploadResponseSchema = z.object({
  success: z.boolean(),
  url: z.string().url(),
  objectName: z.string(),
});

type CropData = {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: string;
};

interface AvatarUploaderProps {
  onImageUpload: (url: string) => void;
  defaultImageUrl?: string;
  name?: string;
}

export function AvatarUploader({
  onImageUpload,
  defaultImageUrl,
  name,
}: Readonly<AvatarUploaderProps>) {
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
  React.useEffect(() => {
    return () => {
      if (blobUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  // Initialize crop as a perfect square (1:1 aspect ratio for avatars)
  const initializeCrop = useCallback(
    (mediaWidth: number, mediaHeight: number) => {
      return centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 100, // Use 100% of width
            x: 0,
            y: 0,
          },
          1, // 1:1 aspect ratio for avatars
          mediaWidth,
          mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
      );
    },
    [],
  );

  // Effect to handle when defaultImageUrl is updated externally
  React.useEffect(() => {
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

  // Handle external image URL
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
      const fileName = url.split("/").pop() ?? "avatar.jpg";
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
        width,
        height,
      });
      console.log("Completed crop:", completedCrop);

      // Calculate scaling factor to translate from displayed to natural dimensions
      const scaleX = naturalWidth / width;
      const scaleY = naturalHeight / height;

      // Scale the crop data to the natural dimensions
      const scaledCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      console.log("Scaled crop:", scaledCrop);

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

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      // Use response.json() directly instead of processing the text
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const rawData = await response.json() as unknown;

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
    maxSize: 5 * 1024 * 1024, // 5MB max size for avatars
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
    const typedCrop = {
      x: crop.x || 0,
      y: crop.y || 0,
      width: crop.width || 0,
      height: crop.height || 0,
      unit: crop.unit,
    };
    setCompletedCrop(typedCrop);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {!showCropper && !isProcessing && (
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={imageUrl ?? undefined} alt="User avatar" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>

          <div
            {...getRootProps()}
            className={`w-full cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-colors ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "hover:border-primary/50 border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-sm">Click or drag to upload a new avatar</p>
          </div>
        </div>
      )}

      {(isProcessing || isUploading) && (
        <div className="flex justify-center p-8 text-center">
          <div>
            <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p>{isUploading ? "Uploading..." : "Processing image..."}</p>
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
              aspect={1} // Force 1:1 aspect ratio
              circularCrop // Make circular crop for avatar
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
              {isUploading ? "Uploading..." : "Save Avatar"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
