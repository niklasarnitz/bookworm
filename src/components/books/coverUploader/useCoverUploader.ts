import { useState, useCallback, useRef, useEffect } from "react";
import { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import {
  type CropData,
  uploadCroppedImage,
  processExternalImageUrl,
} from "./imageUtils";

/**
 * Custom hook for handling cover image uploading and cropping
 */
export function useCoverUploader(defaultImageUrl?: string) {
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

      const processedImage = await processExternalImageUrl(url);
      if (!processedImage) {
        throw new Error("Failed to process image");
      }

      const { blob, fileName } = processedImage;

      // Create a File object from the blob
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

  const uploadImage = async (onSuccess: (url: string) => void) => {
    if (!file || !imgRef.current || !completedCrop) return;

    setIsUploading(true);
    setError(null);

    try {
      // Get the natural dimensions of the image and the displayed dimensions
      const { naturalWidth, naturalHeight, width, height } = imgRef.current;

      // Calculate scaling factors between the displayed image and the natural image
      const scaleX = naturalWidth / width;
      const scaleY = naturalHeight / height;

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

      const result = await uploadCroppedImage(file, boundedCrop);

      if (result.success && result.url) {
        // Clean up the blob URL before setting the new server URL
        if (blobUrlRef.current?.startsWith("blob:")) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }

        setImageUrl(result.url);
        onSuccess(result.url);
        setShowCropper(false);
      } else {
        setError(result.error ?? "Upload failed");
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

    if (acceptedFiles.length === 0) {
      setError("Please select a valid image file");
      return;
    }

    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
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
  };

  return {
    imageUrl,
    isUploading,
    file,
    crop,
    setCrop,
    showCropper,
    error,
    isProcessing,
    imgRef,
    onDrop,
    onImageLoad,
    uploadImage,
    cancelCrop,
    handleCropComplete,
    handleRemoveCover,
  };
}
